const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Configurar eventos do Socket.io para tempo real
 * Este arquivo será expandido significativamente nas próximas fases
 */
const socketHandler = (io) => {
  // Middleware de autenticação para sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        console.log('❌ Socket - Token não fornecido');
        return next(new Error('Token não fornecido'));
      }

      console.log('🔄 Socket - Verificando token:', token.substring(0, 15) + '...');

      try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Socket - Token válido, dados:', decoded);
        
        // Buscar usuário no banco de forma simplificada
        let usuario;
        try {
          usuario = await db.findUserByID(decoded.userId);
        } catch (err) {
          console.log('⚠️ Socket - Erro ao buscar usuário:', err.message);
        }
        
        if (!usuario) {
          console.log('⚠️ Socket - Usuário não encontrado no banco, usando dados do token');
          usuario = {
            id: decoded.userId,
            tipo: decoded.tipo,
            nome_completo: 'Usuário ' + decoded.userId
          };
        }

        // Adicionar dados do usuário ao socket
        socket.user = {
          userId: usuario.id,
          nip: usuario.nip,
          nome: usuario.nome || usuario.nome_completo,
          tipo: usuario.tipo || usuario.tipo_usuario
        };

        console.log(`✅ Socket - Autenticação bem-sucedida para: ${socket.user.nome}`);
        next();
      } catch (jwtError) {
        console.error('❌ Socket - Erro na verificação do token:', jwtError.message);
        next(new Error('Token inválido: ' + jwtError.message));
      }
    } catch (error) {
      console.error('❌ Socket - Erro geral na autenticação:', error);
      next(new Error('Erro na autenticação'));
    }
  });

  // Estrutura em memória para policiais online
  const policiaisOnline = {};

  // Eventos de conexão
  io.on('connection', (socket) => {
    console.log(`✅ Usuário conectado: ${socket.user.nome} (${socket.user.tipo}) - Socket: ${socket.id}`);

    // Adicionar usuário a sala específica do tipo
    socket.join(`tipo_${socket.user.tipo}`);
    
    // Se for polícia ou unidade, adicionar à sala operacional
    if (['policia', 'unidade'].includes(socket.user.tipo)) {
      socket.join('operacional');
    }

    // Se for dashboard/admin, emitir imediatamente a lista de policiais online
    if (['admin', 'dashboard'].includes(socket.user.tipo)) {
      console.log('🖥️ [SOCKET] Dashboard conectado, enviando lista de policiais online:', Object.values(policiaisOnline));
      socket.emit('policiais-online', Object.values(policiaisOnline));
    }

    if (socket.user.tipo === 'policia') {
      console.log(`👮‍♂️ [SOCKET] Policial conectado: ${socket.user.nome} (NIP: ${socket.user.nip}, ID: ${socket.user.userId}) - Socket: ${socket.id}`);
      policiaisOnline[socket.user.userId] = {
        id: socket.user.userId,
        nome: socket.user.nome,
        nip: socket.user.nip,
        status: 'online',
        lat: null,
        lng: null,
        socketId: socket.id
      };
      console.log('👮‍♂️ [SOCKET] Emitindo lista de policiais online para dashboards:', Object.values(policiaisOnline));
      // Emitir lista para dashboards
      io.to('operacional').emit('policiais-online', Object.values(policiaisOnline));
    }

    // Evento de teste de conectividade
    socket.on('ping', (callback) => {
      console.log(`🏓 Ping recebido de ${socket.user.nome}`);
      if (typeof callback === 'function') {
        callback({
          message: 'pong',
          timestamp: new Date().toISOString(),
          user: socket.user.nome
        });
      } else {
        console.log('⚠️ Socket - Callback do ping não é uma função');
        socket.emit('pong', {
          message: 'pong',
          timestamp: new Date().toISOString(),
          user: socket.user.nome
        });
      }
    });

    // Evento para atualizar localização em tempo real do policial
    socket.on('update_location', async (data) => {
      try {
        const { latitude, longitude, endereco } = data;
        console.log(`📍 Localização recebida de ${socket.user.nome}: ${latitude}, ${longitude}`);

        // Salvar no banco de dados
        try {
          await db.query(`
            UPDATE usuarios 
            SET localizacao_lat = $1, localizacao_lng = $2, endereco = $3, atualizado_em = NOW()
            WHERE id = $4
          `, [latitude, longitude, endereco || null, socket.user.userId]);
          console.log(`✅ Localização do usuário ${socket.user.nome} atualizada no banco.`);
        } catch (dbError) {
          console.error('❌ Erro ao atualizar localização no banco:', dbError);
        }

        // Emitir atualização para sala operacional
        io.to('operacional').emit('police_location_update', {
          userId: socket.user.userId,
          nome: socket.user.nome,
          latitude,
          longitude,
          atualizado_em: new Date().toISOString()
        });

        // Notificar confirmação
        socket.emit('location_updated', {
          message: 'Localização atualizada com sucesso',
          timestamp: new Date().toISOString()
        });

        if (socket.user.tipo === 'policia' && policiaisOnline[socket.user.userId]) {
          console.log(`📍 [SOCKET] Localização recebida de ${socket.user.nome} (ID: ${socket.user.userId}): ${latitude}, ${longitude}`);
          policiaisOnline[socket.user.userId].lat = latitude;
          policiaisOnline[socket.user.userId].lng = longitude;
          policiaisOnline[socket.user.userId].status = 'online';
          console.log('👮‍♂️ [SOCKET] Emitindo lista de policiais online para dashboards:', Object.values(policiaisOnline));
          // Emitir lista para dashboards
          io.to('operacional').emit('policiais-online', Object.values(policiaisOnline));
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar localização via socket:', error);
        socket.emit('error', {
          message: 'Erro ao atualizar localização',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Evento para atualizar localização dinâmica do alerta (vítima)
    socket.on('update_alert_location', async (data) => {
      try {
        const { alertId, latitude, longitude } = data;
        if (!alertId || !latitude || !longitude) {
          socket.emit('error', { message: 'alertId, latitude e longitude são obrigatórios' });
          return;
        }
        // Atualizar localização do alerta no banco
        try {
          await db.query(`
            UPDATE alertas 
            SET latitude = $1, longitude = $2, updated_at = NOW()
            WHERE id = $3
          `, [latitude, longitude, alertId]);
          console.log(`✅ Localização do alerta ${alertId} atualizada no banco.`);
        } catch (dbError) {
          console.error('❌ Erro ao atualizar localização do alerta no banco:', dbError);
        }
        // Emitir atualização para sala operacional
        io.to('operacional').emit('alert_location_update', {
          alertId,
          latitude,
          longitude,
          atualizado_em: new Date().toISOString()
        });
        // Notificar confirmação
        socket.emit('alert_location_updated', {
          message: 'Localização do alerta atualizada com sucesso',
          alertId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Erro ao atualizar localização do alerta via socket:', error);
        socket.emit('error', {
          message: 'Erro ao atualizar localização do alerta',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Placeholder para eventos de alerta
    socket.on('emergency_alert', (data) => {
      console.log(`🚨 ALERTA DE EMERGÊNCIA de ${socket.user.nome}: ${JSON.stringify(data)}`);
      console.log('🟢 Dados do alerta recebido:', data);
      socket.emit('alert_received', {
        message: 'Alerta recebido com sucesso',
        timestamp: new Date().toISOString()
      });
    });

    // Evento para juntar-se a uma sala específica
    socket.on('join-room', (roomName) => {
      console.log(`🚪 ${socket.user.nome} juntando-se à sala: ${roomName}`);
      socket.join(roomName);
      socket.emit('room-joined', {
        room: roomName,
        message: `Juntou-se à sala ${roomName}`,
        timestamp: new Date().toISOString()
      });
    });

    // Evento para sair de uma sala específica
    socket.on('leave-room', (roomName) => {
      console.log(`🚪 ${socket.user.nome} saindo da sala: ${roomName}`);
      socket.leave(roomName);
      socket.emit('room-left', {
        room: roomName,
        message: `Saiu da sala ${roomName}`,
        timestamp: new Date().toISOString()
      });
    });

    // Eventos de desconexão
    socket.on('disconnect', async () => {
      console.log(`❌ Usuário desconectado: ${socket.user.nome} - Razão: desconexão`);
      if (socket.user && socket.user.tipo === 'policia') {
        console.log(`❌ [SOCKET] Policial desconectado: ${socket.user.nome} (ID: ${socket.user.userId}) - Socket: ${socket.id}`);
        delete policiaisOnline[socket.user.userId];
        console.log('👮‍♂️ [SOCKET] Emitindo lista de policiais online para dashboards:', Object.values(policiaisOnline));
        // Emitir lista para dashboards
        io.to('operacional').emit('policiais-online', Object.values(policiaisOnline));
      }
    });
  });

  // Log de estatísticas de conexão a cada minuto
  setInterval(() => {
    const connectedSockets = io.sockets.sockets.size;
    if (connectedSockets > 0) {
      console.log(`📊 Sockets conectados: ${connectedSockets}`);
    }
  }, 60000);
};

module.exports = socketHandler; 