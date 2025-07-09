const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Armazenar conexões ativas de rastreamento
const activeTracking = new Map();

// Zonas de perigo conhecidas em Luanda
const DANGER_ZONES = [
    {
        name: "Zona Alta",
        center: { lat: -8.8331, lng: 13.2245 },
        radius: 1000, // metros
        risk: "alto"
    },
    {
        name: "Bairro Popular",
        center: { lat: -8.8532, lng: 13.2411 },
        radius: 800,
        risk: "médio"
    }
];

// Calcular velocidade entre dois pontos
function calculateSpeed(point1, point2, timeDiff) {
    const R = 6371; // Raio da Terra em km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distância em km
    
    // Converter tempo para horas
    const hours = timeDiff / (1000 * 60 * 60);
    
    // Calcular velocidade em km/h
    return distance / hours;
}

// Calcular direção entre dois pontos
function calculateDirection(point1, point2) {
    const dLon = point2.lng - point1.lng;
    const y = Math.sin(dLon) * Math.cos(point2.lat);
    const x = Math.cos(point1.lat) * Math.sin(point2.lat) -
              Math.sin(point1.lat) * Math.cos(point2.lat) * Math.cos(dLon);
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    
    // Converter para direções cardeais
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(bearing / 45) & 7;
    return directions[index];
}

// Verificar se está próximo a zona de perigo
function checkDangerZones(position) {
    const nearbyZones = [];
    
    DANGER_ZONES.forEach(zone => {
        const distance = calculateDistance(position, zone.center);
        if (distance <= zone.radius / 1000) { // Converter metros para km
            nearbyZones.push({
                ...zone,
                distance: distance.toFixed(2)
            });
        }
    });
    
    return nearbyZones;
}

// Calcular desvio de rota
function calculateRouteDeviation(currentPath, expectedPath) {
    if (currentPath.length < 2 || expectedPath.length < 2) return null;
    
    const currentDirection = calculateDirection(
        currentPath[currentPath.length - 2],
        currentPath[currentPath.length - 1]
    );
    
    const expectedDirection = calculateDirection(
        expectedPath[expectedPath.length - 2],
        expectedPath[expectedPath.length - 1]
    );
    
    return {
        current: currentDirection,
        expected: expectedDirection,
        isDeviating: currentDirection !== expectedDirection
    };
}

// Iniciar rastreamento de um alerta
router.post('/start', auth, async (req, res) => {
    try {
        const { alertId } = req.body;
        
        // Verificar se o alerta existe e está ativo
        const alertQuery = `
            SELECT a.*, u.nome_completo as user_nome
            FROM alertas a
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.id = $1 AND a.status = 'ativo'
        `;
        
        const alertResult = await db.query(alertQuery, [alertId]);
        
        if (!alertResult.rows || alertResult.rows.length === 0) {
            return res.status(404).json({ error: 'Alerta não encontrado ou inativo' });
        }
        
        const alert = alertResult.rows[0];
        
        // Armazenar conexão de rastreamento com dados adicionais
        activeTracking.set(alertId, {
            alert,
            lastUpdate: new Date(),
            socket: req.app.get('io'),
            path: [{
                lat: parseFloat(alert.latitude),
                lng: parseFloat(alert.longitude),
                timestamp: new Date()
            }],
            speedHistory: [],
            directionHistory: []
        });
        
        // Notificar início do rastreamento
        req.app.get('io').to('operacional').emit('tracking-started', {
            alertId,
            alert
        });
        
        res.json({ message: 'Rastreamento iniciado' });
        
    } catch (error) {
        console.error('Erro ao iniciar rastreamento:', error);
        res.status(500).json({ error: 'Erro ao iniciar rastreamento' });
    }
});

// Parar rastreamento
router.post('/stop', auth, async (req, res) => {
    try {
        const { alertId } = req.body;
        
        if (activeTracking.has(alertId)) {
            activeTracking.delete(alertId);
            
            // Notificar parada do rastreamento
            req.app.get('io').to('operacional').emit('tracking-stopped', {
                alertId
            });
        }
        
        res.json({ message: 'Rastreamento parado' });
        
    } catch (error) {
        console.error('Erro ao parar rastreamento:', error);
        res.status(500).json({ error: 'Erro ao parar rastreamento' });
    }
});

// Atualizar posição do alerta
router.post('/update', auth, async (req, res) => {
    try {
        const { alertId, latitude, longitude } = req.body;
        
        if (!activeTracking.has(alertId)) {
            return res.status(404).json({ error: 'Rastreamento não encontrado' });
        }
        
        const tracking = activeTracking.get(alertId);
        const newPosition = {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
            timestamp: new Date()
        };
        
        // Calcular velocidade
        const lastPosition = tracking.path[tracking.path.length - 1];
        const timeDiff = newPosition.timestamp - lastPosition.timestamp;
        const speed = calculateSpeed(lastPosition, newPosition, timeDiff);
        
        // Calcular direção
        const direction = calculateDirection(lastPosition, newPosition);
        
        // Verificar zonas de perigo
        const nearbyDangerZones = checkDangerZones(newPosition);
        
        // Calcular desvio de rota
        const routeDeviation = calculateRouteDeviation(
            tracking.path,
            [lastPosition, newPosition]
        );
        
        // Atualizar histórico
        tracking.path.push(newPosition);
        tracking.speedHistory.push(speed);
        tracking.directionHistory.push(direction);
        
        // Manter apenas últimas 10 posições para análise
        if (tracking.path.length > 10) {
            tracking.path.shift();
            tracking.speedHistory.shift();
            tracking.directionHistory.shift();
        }
        
        // Atualizar posição no banco
        const updateQuery = `
            UPDATE alertas 
            SET latitude = $1, longitude = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await db.query(updateQuery, [latitude, longitude, alertId]);
        
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ error: 'Alerta não encontrado' });
        }
        
        // Emitir atualização via Socket.io com dados adicionais
        req.app.get('io').to('operacional').emit('alert-position-update', {
            alertId,
            latitude,
            longitude,
            timestamp: new Date(),
            speed: speed.toFixed(1),
            direction,
            nearbyDangerZones,
            routeDeviation,
            averageSpeed: (tracking.speedHistory.reduce((a, b) => a + b, 0) / tracking.speedHistory.length).toFixed(1)
        });
        
        res.json({ 
            message: 'Posição atualizada',
            speed: speed.toFixed(1),
            direction,
            nearbyDangerZones,
            routeDeviation
        });
        
    } catch (error) {
        console.error('Erro ao atualizar posição:', error);
        res.status(500).json({ error: 'Erro ao atualizar posição' });
    }
});

// Obter status do rastreamento
router.get('/status/:alertId', auth, async (req, res) => {
    try {
        const { alertId } = req.params;
        
        if (!activeTracking.has(alertId)) {
            return res.json({ active: false });
        }
        
        const tracking = activeTracking.get(alertId);
        
        res.json({
            active: true,
            alert: tracking.alert,
            lastUpdate: tracking.lastUpdate
        });
        
    } catch (error) {
        console.error('Erro ao obter status do rastreamento:', error);
        res.status(500).json({ error: 'Erro ao obter status do rastreamento' });
    }
});

module.exports = router; 