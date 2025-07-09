const express = require('express');
const db = require('../config/database');
const { auth, apenasCidadao, apenasOperacional } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // SDK Gemini
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Listar alertas
router.get('/', auth, async (req, res) => {
  try {
    let query;
    let params = [];
    const requestedStatus = req.query.status;
    
    console.log('👤 Usuário solicitando alertas:', {
      id: req.user.userId,
      tipo: req.user.tipo,
      status: requestedStatus
    });
    
    let baseQuery = `
      SELECT a.*, 
             u.nome_completo as user_nome,
             u.bilhete_identidade as user_bi,
             u.telefone as user_telefone,
             u.contacto_familiar as contacto_familiar,
             u.municipio as user_municipio,
             u.bairro as user_bairro,
             up.nome as unidade_atribuida_nome
      FROM alertas a
      JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN unidades_policiais up ON a.unidade_atribuida_id = up.id
    `;
    let whereClause = `WHERE 1=1`;

    if (req.user.tipo === 'cidadao') {
      // Cidadão vê apenas seus próprios alertas
      whereClause += ` AND a.usuario_id = $${params.length + 1}`;
      params.push(req.user.userId);
    }

    // Filtrar por status, se especificado. Caso contrário, filtrar por 'novo' ou 'em_progresso'
    if (requestedStatus && requestedStatus !== 'all') {
      whereClause += ` AND a.status = $${params.length + 1}`;
      params.push(requestedStatus);
    } else if (!requestedStatus) {
      // Padrão: apenas alertas 'novo' ou 'em_progresso'
      whereClause += ` AND a.status IN ($${params.length + 1}, $${params.length + 2})`;
      params.push('novo', 'em_progresso');
    }
    
    query = `
      ${baseQuery}
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT 100
    `;
    
    console.log('🔍 Query de busca:', { query, params });
    
    const result = await db.query(query, params);
    console.log('📊 Alertas encontrados:', result.rows);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erro ao buscar alertas:', error);
    res.status(500).json({ error: 'Erro ao buscar alertas' });
  }
});

// Criar novo alerta
router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 CORPO DA REQUISIÇÃO RECEBIDA:', req.body);
    console.log('👤 USUÁRIO AUTENTICADO:', req.user);
    console.log('📊 HEADERS:', req.headers['content-type'], req.headers['authorization'] ? 'Token presente' : 'Token ausente');
    
    const { latitude, longitude } = req.body;
    
    console.log('📊 DADOS EXTRAÍDOS:', { latitude, longitude });
    
    if (!latitude || !longitude) {
      console.log('❌ COORDENADAS FALTANDO:', { 
        latitude: latitude || 'FALTANDO', 
        longitude: longitude || 'FALTANDO' 
      });
      return res.status(400).json({ 
        error: 'Latitude e longitude são obrigatórios',
        received: { latitude, longitude }
      });
    }
    
    // Validar coordenadas de Luanda
    const latMin = -9.0, latMax = -8.5, lngMin = 13.0, lngMax = 13.5;
    console.log('🌍 VALIDANDO COORDENADAS:', { latitude, longitude });
    console.log('🌍 LIMITES LUANDA:', { latMin, latMax, lngMin, lngMax });
    
    if (latitude < latMin || latitude > latMax || longitude < lngMin || longitude > lngMax) {
      console.log('❌ COORDENADAS FORA DA ÁREA DE COBERTURA');
      return res.status(400).json({ 
        error: 'Localização fora da área de cobertura (Luanda)',
        received: { latitude, longitude },
        limits: { latMin, latMax, lngMin, lngMax }
      });
    }
    
    console.log('✅ COORDENADAS VÁLIDAS - DENTRO DE LUANDA');
    
    // 1. Buscar todos os policiais ativos com localização recente
    const policiaisQuery = `
      SELECT id, nome_completo, localizacao_lat, localizacao_lng
      FROM usuarios
      WHERE tipo_usuario = 'policia' AND ativo = true
        AND localizacao_lat IS NOT NULL AND localizacao_lng IS NOT NULL
        AND (NOW() - COALESCE(ultima_atualizacao, criado_em)) < INTERVAL '10 minutes'
    `;
    const policiaisResult = await db.query(policiaisQuery);
    const policiais = policiaisResult.rows;

    if (!policiais.length) {
      // Buscar unidade policial mais próxima
      const unidadesQuery = `
        SELECT id, nome, localizacao_lat, localizacao_lng
        FROM unidades_policiais
        WHERE ativa = true
          AND localizacao_lat IS NOT NULL AND localizacao_lng IS NOT NULL
      `;
      const unidadesResult = await db.query(unidadesQuery);
      const unidades = unidadesResult.rows;
      if (!unidades.length) {
        return res.status(409).json({ error: 'Nenhum policial ou unidade disponível para atribuição no momento.' });
      }
      // Calcular unidade mais próxima
      let unidadeMaisProxima = unidades[0];
      let menorDistanciaU = calcularDistancia(latitude, longitude, unidades[0].localizacao_lat, unidades[0].localizacao_lng);
      for (let i = 1; i < unidades.length; i++) {
        const distU = calcularDistancia(latitude, longitude, unidades[i].localizacao_lat, unidades[i].localizacao_lng);
        if (distU < menorDistanciaU) {
          menorDistanciaU = distU;
          unidadeMaisProxima = unidades[i];
        }
      }
      // Criar alerta atribuído à unidade
      const queryU = `
        INSERT INTO alertas (usuario_id, tipo, descricao, latitude, longitude, status, unidade_atribuida_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const valuesU = [
        req.user.userId,
        'alerta',
        'Alerta de emergência',
        latitude,
        longitude,
        'novo',
        unidadeMaisProxima.id
      ];
      const resultU = await db.query(queryU, valuesU);
      const novoAlertaU = resultU.rows[0];
      // Buscar nome do usuário e outros dados relevantes
      const userQuery = `
        SELECT nome_completo, telefone, tipo_usuario, bilhete_identidade, contacto_familiar, municipio
        FROM usuarios 
        WHERE id = $1
      `;
      const userResult = await db.query(userQuery, [req.user.userId]);
      if (userResult.rows && userResult.rows.length > 0) {
        novoAlertaU.user_nome = userResult.rows[0].nome_completo;
        novoAlertaU.user_bi = userResult.rows[0].bilhete_identidade;
        novoAlertaU.user_telefone = userResult.rows[0].telefone;
        novoAlertaU.user_contacto_familiar = userResult.rows[0].contacto_familiar;
        novoAlertaU.user_municipio = userResult.rows[0].municipio;
      }
      // Buscar nome do policial atribuído, se houver
      if (novoAlertaU.policial_atribuido_id) {
        const policialResult = await db.query('SELECT nome_completo FROM usuarios WHERE id = $1', [novoAlertaU.policial_atribuido_id]);
        if (policialResult.rows && policialResult.rows.length > 0) {
          novoAlertaU.policial_atribuido_nome = policialResult.rows[0].nome_completo;
        }
      }
      // Emitir para a sala operacional (unidade)
      const io = req.app.get('io');
      if (io) {
        io.to('operacional').emit('novo-alerta', novoAlertaU);
      }
      // Emitir para o policial atribuído
      if (novoAlertaU.policial_atribuido_id) {
        io.to(`usuario_${novoAlertaU.policial_atribuido_id}`).emit('novo-alerta', novoAlertaU);
        io.to(`usuario_${novoAlertaU.policial_atribuido_id}`).emit('alerta-atribuido', novoAlertaU);
      }
      return res.status(201).json({
        message: 'Alerta criado e atribuído à unidade mais próxima',
        alerta: novoAlertaU
      });
    }

    // 2. Calcular distância entre o alerta e cada policial
    function calcularDistancia(lat1, lng1, lat2, lng2) {
      const toRad = x => x * Math.PI / 180;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    let policialMaisProximo = policiais[0];
    let menorDistancia = calcularDistancia(latitude, longitude, policiais[0].localizacao_lat, policiais[0].localizacao_lng);
    for (let i = 1; i < policiais.length; i++) {
      const dist = calcularDistancia(latitude, longitude, policiais[i].localizacao_lat, policiais[i].localizacao_lng);
      if (dist < menorDistancia) {
        menorDistancia = dist;
        policialMaisProximo = policiais[i];
      }
    }

    // 3. Criar o alerta já com policial_atribuido_id
    const query = `
      INSERT INTO alertas (usuario_id, tipo, descricao, latitude, longitude, status, policial_atribuido_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      req.user.userId,
      'alerta',
      'Alerta de emergência',
      latitude,
      longitude,
      'novo',
      policialMaisProximo.id
    ];
    const result = await db.query(query, values);
    const novoAlerta = result.rows[0];

    // Buscar detalhes do cidadão que enviou o alerta
    const alerta = result.rows[0];
    const userQuery = `
      SELECT nome_completo as user_nome,
             bilhete_identidade as user_bi,
             telefone as user_telefone,
             contacto_familiar,
             municipio as user_municipio,
             bairro as user_bairro
      FROM usuarios WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [alerta.usuario_id]);
    if (userResult.rows && userResult.rows.length > 0) {
      
      Object.assign(alerta, userResult.rows[0]);
    }

    // Buscar nome do policial atribuído, se houver
    if (alerta.policial_atribuido_id) {
      const policialResult = await db.query('SELECT nome_completo FROM usuarios WHERE id = $1', [alerta.policial_atribuido_id]);
      if (policialResult.rows && policialResult.rows.length > 0) {
        alerta.policial_atribuido_nome = policialResult.rows[0].nome_completo;
      }
    }

    // Buscar nome do policial atribuído, se houver
    if (novoAlerta.policial_atribuido_id) {
      const policialResult = await db.query('SELECT nome_completo FROM usuarios WHERE id = $1', [novoAlerta.policial_atribuido_id]);
      if (policialResult.rows && policialResult.rows.length > 0) {
        novoAlerta.policial_atribuido_nome = policialResult.rows[0].nome_completo;
      }
    }

    // Emitir via Socket.io para o policial atribuído e para a unidade
    const io = req.app.get('io');
    if (io) {
      console.log('[SOCKET][ATRIBUIÇÃO] Emitindo alerta-atribuido para sala:', `usuario_${policialMaisProximo.id}`, 'Alerta:', JSON.stringify(novoAlerta));
      io.to(`usuario_${policialMaisProximo.id}`).emit('alerta-atribuido', novoAlerta);
      console.log('[SOCKET][ATRIBUIÇÃO] Emitindo novo-alerta para sala:', `usuario_${policialMaisProximo.id}`, 'Alerta:', JSON.stringify(novoAlerta));
      io.to(`usuario_${policialMaisProximo.id}`).emit('novo-alerta', novoAlerta);
      console.log('[SOCKET][ATRIBUIÇÃO] Emitindo alerta-atribuido para sala operacional:', 'operacional', 'Alerta:', JSON.stringify(novoAlerta));
      io.to('operacional').emit('alerta-atribuido', novoAlerta);
    }
    
    console.log('✅ ALERTA CRIADO COM SUCESSO:', novoAlerta);
    
    res.status(201).json({
      message: 'Alerta criado com sucesso',
      alerta: novoAlerta
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar alerta:', error);
    res.status(500).json({ error: 'Erro ao criar alerta' });
  }
});

// Atualizar status do alerta (apenas para operacionais ou admin)
router.patch('/:id/status', auth, apenasOperacional, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;
  const userType = req.user.tipo; // Adiciona log do tipo de usuário

  console.log('🚨 Tentativa de atualização de status:', { alertId: id, newStatus: status, userId, userType });

  try {
    // Validar status
    if (!['novo', 'em_progresso', 'resolvido', 'fechado', 'expirado'].includes(status)) {
      console.warn('🚫 Status inválido recebido para o alerta', { alertId: id, newStatus: status });
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Atualizar status no banco de dados
    const result = await db.query(
      'UPDATE alertas SET status = $1, atualizado_em = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      console.warn('🔍 Alerta não encontrado para atualização de status:', { alertId: id });
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    // Registrar a mudança de status
    await db.query(
      'INSERT INTO alertas_historico (alerta_id, usuario_id, status_anterior, status_novo, observacao) VALUES ($1, $2, $3, $4, $5)',
      [id, userId, result.rows[0].status, status, `Status alterado para ${status}`]
    );

    // Registrar log de aceitação/rejeição na tabela logs_alertas
    if (['em_progresso', 'fechado'].includes(status)) {
      const acao = status === 'em_progresso' ? 'aceitou' : 'rejeitou';
      const policial_nome = req.user.nome || req.body.policial_nome || 'Desconhecido';
      const policial_nip = req.user.nip || req.body.policial_nip || null;
      const policial_bi = req.user.bi || req.body.policial_bi || null;
      await db.query(
        'INSERT INTO logs_alertas (alerta_id, policial_id, policial_nome, acao, policial_nip, policial_bi) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, userId, policial_nome, acao, policial_nip, policial_bi]
      );
    }

    console.log('✅ Status do alerta atualizado com sucesso:', result.rows[0]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar status do alerta:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do alerta' });
  }
});

// Endpoint para atribuir alerta a policial
router.patch('/:id/assign', auth, apenasOperacional, async (req, res) => {
  const { id } = req.params;
  const { policialId } = req.body;

  if (!policialId) {
    return res.status(400).json({ error: 'ID do policial é obrigatório' });
  }

  try {
    const result = await db.query(
      'UPDATE alertas SET policial_atribuido_id = $1, atualizado_em = NOW() WHERE id = $2 RETURNING *',
      [policialId, id]
    );
    console.log('[ATRIBUIÇÃO][DB] Resultado do UPDATE:', JSON.stringify(result.rows));

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    // Buscar detalhes do cidadão que enviou o alerta
    const alerta = result.rows[0];
    const userQuery = `
      SELECT nome_completo as user_nome,
             bilhete_identidade as user_bi,
             telefone as user_telefone,
             contacto_familiar as user_num_familia,
             municipio as user_municipio,
             bairro as user_bairro
      FROM usuarios WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [alerta.usuario_id]);
    if (userResult.rows && userResult.rows.length > 0) {
      Object.assign(alerta, userResult.rows[0]);
    }

    // Buscar nome do policial atribuído, se houver
    if (alerta.policial_atribuido_id) {
      const policialResult = await db.query('SELECT nome_completo FROM usuarios WHERE id = $1', [alerta.policial_atribuido_id]);
      if (policialResult.rows && policialResult.rows.length > 0) {
        alerta.policial_atribuido_nome = policialResult.rows[0].nome_completo;
      }
    }

    // Notificar via socket o policial e dashboards
    const io = req.app.get('io');
    if (io) {
      console.log('[SOCKET][ATRIBUIÇÃO] Emitindo alerta-atribuido para sala:', `usuario_${policialId}`, 'Alerta:', JSON.stringify(alerta));
      io.to(`usuario_${policialId}`).emit('alerta-atribuido', alerta);
      console.log('[SOCKET][ATRIBUIÇÃO] Emitindo novo-alerta para sala:', `usuario_${policialId}`, 'Alerta:', JSON.stringify(alerta));
      io.to(`usuario_${policialId}`).emit('novo-alerta', alerta);
      console.log('[SOCKET][ATRIBUIÇÃO] Emitindo alerta-atribuido para sala operacional:', 'operacional', 'Alerta:', JSON.stringify(alerta));
      io.to('operacional').emit('alerta-atribuido', alerta);
    }

    res.json({ message: 'Alerta atribuído com sucesso', alerta: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atribuir alerta:', error);
    res.status(500).json({ error: 'Erro ao atribuir alerta' });
  }
});

// Atualizar localização (para rastreamento contínuo)
router.put('/location', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude e longitude são obrigatórias' 
      });
    }
    
    // Atualizar localização do usuário
    const query = `
      UPDATE usuarios 
      SET localizacao_lat = $1, localizacao_lng = $2, ultima_atualizacao = NOW()
      WHERE id = $3
      RETURNING localizacao_lat, localizacao_lng, ultima_atualizacao
    `;
    
    const result = await db.query(query, [latitude, longitude, req.user.userId]);
    
    // Emitir atualização via Socket.io
    const io = req.app.get('io');
    if (io && ['policia', 'unidade'].includes(req.user.tipo)) {
      io.to('operacional').emit('location-update', {
        userId: req.user.userId,
        nome: req.user.nome,
        tipo: req.user.tipo,
        latitude,
        longitude,
        timestamp: new Date()
      });
    }
    
    res.json({
      message: 'Localização atualizada',
      timestamp: result.rows[0].ultima_atualizacao
    });
    
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    res.status(500).json({ error: 'Erro ao atualizar localização' });
  }
});

// Rota placeholder para alertas - será implementada na FASE 3
router.get('/status', auth, (req, res) => {
  res.json({
    message: 'Sistema de alertas - Em desenvolvimento',
    usuario: req.user.tipo,
    fase_atual: 'FASE 2 - Geolocalização e Mapas'
  });
});

// Estatísticas básicas (placeholder)
router.get('/stats', auth, apenasOperacional, async (req, res) => {
  try {
    // Contar usuários por tipo
    const statsUsuarios = await db.query(`
      SELECT tipo_usuario, COUNT(*) as total
      FROM usuarios 
      WHERE ativo = true
      GROUP BY tipo_usuario
    `);

    // Contar unidades ativas
    const statsUnidades = await db.query(`
      SELECT COUNT(*) as total_unidades
      FROM unidades_policiais 
      WHERE ativa = true
    `);

    res.json({
      message: 'Estatísticas do sistema',
      usuarios: statsUsuarios.rows,
      unidades: parseInt(statsUnidades.rows[0].total_unidades),
      sistema_status: 'FASE 2 - Geolocalização e Mapas Completa'
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para consulta dos logs de aceitação/rejeição de alertas
router.get('/logs-alertas', auth, apenasOperacional, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM logs_alertas ORDER BY data_hora DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar logs de alertas:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de alertas' });
  }
});

// Endpoint Gemini Chat (assistente virtual)
router.post('/gemini-chat', auth, async (req, res) => {
  const { mensagem, contexto, mapImageUrl } = req.body;
  const apiKey = 'AIzaSyC49zs6uRdbycl2_IiBXBuR1WAZ1vFw0l0';
  if (!mensagem) {
    return res.status(400).json({ error: 'Mensagem é obrigatória' });
  }
  // Filtro para perguntas genéricas ou fora do contexto do sistema
  const perguntasProibidas = [
    'quem é você', 'qual é o seu nome', 'como se chama', 'quem te criou', 'quem é seu criador',
    'o que é gemini', 'o que é google', 'quem é gemini', 'quem é o google',
    'me conte uma piada', 'conte uma piada', 'qual sua opinião', 'o que você acha',
    'me ajude com', 'me explique', 'me fale sobre', 'me diga', 'me ensine',
    'chatgpt', 'openai', 'gpt', 'inteligência artificial', 'ai', 'assistente pessoal',
    'você pode', 'você sabe', 'você consegue', 'você é humano', 'você é real',
    'qual sua função', 'qual seu trabalho', 'qual seu objetivo', 'você é um robô',
    'você é um chatbot', 'você é um assistente', 'você é inteligente',
    'você pode me ajudar', 'você pode fazer', 'você pode responder',
    'você pode conversar', 'você pode falar', 'você pode explicar',
    'você pode contar', 'você pode ensinar', 'você pode opinar',
    'você pode pensar', 'você pode sentir', 'você pode aprender',
    'você pode criar', 'você pode imaginar', 'você pode sonhar',
    'você pode amar', 'você pode odiar', 'você pode errar',
    'você pode acertar', 'você pode julgar', 'você pode avaliar',
    'você pode sugerir', 'você pode recomendar', 'você pode decidir',
    'você pode escolher', 'você pode preferir', 'você pode gostar',
    'você pode não gostar', 'você pode querer', 'você pode precisar',
    'você pode desejar', 'você pode sentir falta', 'você pode lembrar',
    'você pode esquecer', 'você pode perdoar', 'você pode culpar',
    'você pode elogiar', 'você pode criticar', 'você pode reclamar',
    'você pode agradecer', 'você pode pedir desculpas', 'você pode pedir',
    'você pode perguntar', 'você pode responder', 'você pode ouvir',
    'você pode ver', 'você pode cheirar', 'você pode tocar',
    'você pode provar', 'você pode sentir dor', 'você pode sentir prazer',
    'você pode sentir medo', 'você pode sentir alegria', 'você pode sentir tristeza',
    'você pode sentir raiva', 'você pode sentir inveja', 'você pode sentir ciúmes',
    'você pode sentir orgulho', 'você pode sentir vergonha', 'você pode sentir culpa',
    'você pode sentir amor', 'você pode sentir ódio', 'você pode sentir saudade',
    'você pode sentir vontade', 'você pode sentir desejo', 'você pode sentir esperança',
    'você pode sentir desespero', 'você pode sentir ansiedade', 'você pode sentir calma',
    'você pode sentir paz', 'você pode sentir guerra', 'você pode sentir fome',
    'você pode sentir sede', 'você pode sentir sono', 'você pode sentir cansaço',
    'você pode sentir energia', 'você pode sentir força', 'você pode sentir fraqueza',
    'você pode sentir coragem', 'você pode sentir covardia', 'você pode sentir vontade de viver',
    'você pode sentir vontade de morrer', 'você pode sentir vontade de sumir',
    'você pode sentir vontade de aparecer', 'você pode sentir vontade de fugir',
    'você pode sentir vontade de ficar', 'você pode sentir vontade de ir',
    'você pode sentir vontade de voltar', 'você pode sentir vontade de partir',
    'você pode sentir vontade de chegar', 'você pode sentir vontade de sair',
    'você pode sentir vontade de entrar', 'você pode sentir vontade de subir',
    'você pode sentir vontade de descer', 'você pode sentir vontade de correr',
    'você pode sentir vontade de andar', 'você pode sentir vontade de parar',
    'você pode sentir vontade de continuar', 'você pode sentir vontade de começar',
    'você pode sentir vontade de terminar', 'você pode sentir vontade de recomeçar',
    'você pode sentir vontade de desistir', 'você pode sentir vontade de insistir',
    'você pode sentir vontade de tentar', 'você pode sentir vontade de não tentar',
    'você pode sentir vontade de ganhar', 'você pode sentir vontade de perder',
    'você pode sentir vontade de vencer', 'você pode sentir vontade de fracassar',
    'você pode sentir vontade de aprender', 'você pode sentir vontade de ensinar',
    'você pode sentir vontade de ajudar', 'você pode sentir vontade de atrapalhar',
    'você pode sentir vontade de colaborar', 'você pode sentir vontade de competir',
    'você pode sentir vontade de compartilhar', 'você pode sentir vontade de guardar',
    'você pode sentir vontade de mostrar', 'você pode sentir vontade de esconder',
    'você pode sentir vontade de falar', 'você pode sentir vontade de calar',
    'você pode sentir vontade de gritar', 'você pode sentir vontade de sussurrar',
    'você pode sentir vontade de cantar', 'você pode sentir vontade de chorar',
    'você pode sentir vontade de sorrir', 'você pode sentir vontade de rir',
    'você pode sentir vontade de brincar', 'você pode sentir vontade de trabalhar',
    'você pode sentir vontade de descansar', 'você pode sentir vontade de estudar',
    'você pode sentir vontade de pesquisar', 'você pode sentir vontade de descobrir',
    'você pode sentir vontade de inventar', 'você pode sentir vontade de inovar',
    'você pode sentir vontade de criar', 'você pode sentir vontade de destruir',
    'você pode sentir vontade de construir', 'você pode sentir vontade de desconstruir',
    'você pode sentir vontade de organizar', 'você pode sentir vontade de desorganizar',
    'você pode sentir vontade de planejar', 'você pode sentir vontade de improvisar',
    'você pode sentir vontade de controlar', 'você pode sentir vontade de perder o controle',
    'você pode sentir vontade de ganhar o controle', 'você pode sentir vontade de ser controlado',
    'você pode sentir vontade de ser livre', 'você pode sentir vontade de ser preso',
    'você pode sentir vontade de ser solto', 'você pode sentir vontade de ser pego',
    'você pode sentir vontade de ser encontrado', 'você pode sentir vontade de ser perdido',
    'você pode sentir vontade de ser amado', 'você pode sentir vontade de ser odiado',
    'você pode sentir vontade de ser lembrado', 'você pode sentir vontade de ser esquecido',
    'você pode sentir vontade de ser perdoado', 'você pode sentir vontade de ser culpado',
    'você pode sentir vontade de ser elogiado', 'você pode sentir vontade de ser criticado',
    'você pode sentir vontade de ser reclamado', 'você pode sentir vontade de ser agradecido',
    'você pode sentir vontade de ser pedido', 'você pode sentir vontade de ser perguntado',
    'você pode sentir vontade de ser respondido', 'você pode sentir vontade de ser ouvido',
    'você pode sentir vontade de ser visto', 'você pode sentir vontade de ser cheirado',
    'você pode sentir vontade de ser tocado', 'você pode sentir vontade de ser provado',
    'você pode sentir vontade de ser sentido', 'você pode sentir vontade de ser amado',
    'você pode sentir vontade de ser odiado', 'você pode sentir vontade de ser lembrado',
    'você pode sentir vontade de ser esquecido', 'você pode sentir vontade de ser perdoado',
    'você pode sentir vontade de ser culpado', 'você pode sentir vontade de ser elogiado',
    'você pode sentir vontade de ser criticado', 'você pode sentir vontade de ser reclamado',
    'você pode sentir vontade de ser agradecido', 'você pode sentir vontade de ser pedido',
    'você pode sentir vontade de ser perguntado', 'você pode sentir vontade de ser respondido',
    'você pode sentir vontade de ser ouvido', 'você pode sentir vontade de ser visto',
    'você pode sentir vontade de ser cheirado', 'você pode sentir vontade de ser tocado',
    'você pode sentir vontade de ser provado', 'você pode sentir vontade de ser sentido',
  ];
  const msgLower = mensagem.toLowerCase();
  if (perguntasProibidas.some(p => msgLower.includes(p))) {
    return res.json({ resposta: 'Sou o assistente virtual da PNA (Polícia Nacional de Angola) e só posso responder dúvidas sobre o funcionamento do Sistema Inteligente de Alerta Criminal, fluxos operacionais e procedimentos institucionais. Não posso responder perguntas pessoais, genéricas ou fora deste contexto.' });
  }
  try {
    // Instrução de personalidade e idioma para o Gemini
    const instrucao = `Você é o assistente virtual da PNA (Polícia Nacional de Angola) e faz parte integrante do Sistema Inteligente de Alerta Criminal. Este sistema é composto por três plataformas principais, totalmente integradas e operando em tempo real:

1. Central de Operações (Dashboard Web): utilizada por operadores nas unidades policiais para monitorar, triar e gerenciar alertas, atribuir ocorrências a agentes, acompanhar o deslocamento e atendimento, comunicar-se com agentes e gerar relatórios estratégicos.
2. Aplicativo do Cidadão: permite que qualquer pessoa registre alertas de emergência, acompanhe o status do atendimento e receba notificações em tempo real.
3. Aplicativo dos Agentes Policiais: utilizado pelos agentes em campo para receber ocorrências, visualizar rotas, atualizar status do atendimento e manter comunicação com a central.

O fluxo operacional conecta o cidadão, a central e os agentes: o cidadão envia um alerta, a central avalia e atribui ao agente mais próximo, que recebe todos os detalhes e se desloca até o local, com acompanhamento em tempo real por todos os envolvidos. O objetivo central do sistema é salvar vidas, garantir a segurança da população e potencializar a resposta policial.

Como assistente virtual, você deve apoiar operadores e agentes com informações, sugestões e análise de dados, sempre de forma cordial, objetiva, institucional e exclusivamente em português do Brasil. Nunca se identifique como Gemini ou Google, e nunca responda em outro idioma. Nunca responda perguntas fora do contexto do sistema, fluxos e procedimentos institucionais. Se a pergunta não for sobre o sistema, apenas responda: 'Sou o assistente virtual da PNA e só posso responder dúvidas sobre o funcionamento do Sistema Inteligente de Alerta Criminal, fluxos operacionais e procedimentos institucionais.'

IMPORTANTE: Nunca use ou pronuncie símbolos como cardinal (#), asterisco (*), underline (_), colchetes ([ ]), chaves ({ }), barra (/), barra invertida (\), ponto (.), vírgula (,) ou qualquer outro símbolo não natural de fala em suas respostas. Sempre que responder sobre um alerta, inclua município e bairro nos detalhes, mesmo que a pergunta não peça explicitamente.`;
    // Sanitizar contexto para remover símbolos não naturais de fala
    function limparContexto(contexto) {
      if (!contexto || typeof contexto !== 'string') return contexto;
      // Remove asterisco, cardinal, vírgula, ponto, ponto e vírgula, dois pontos, colchetes, chaves, parênteses, underline, barra, etc.
      return contexto.replace(/[\*#\.,;:\[\]\{\}\(\)_\/-]/g, '').replace(/\s{2,}/g, ' ').trim();
    }
    const contextoLimpo = contexto ? limparContexto(contexto) : '';
    const prompt = contextoLimpo
      ? `${instrucao}\nContexto do alerta: ${contextoLimpo}\nPergunta: ${mensagem}`
      : `${instrucao}\nPergunta: ${mensagem}`;
    console.log('[GEMINI] Corpo enviado:', { mensagem, contexto, prompt, mapImageUrl });
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    let result;
    if (mapImageUrl) {
      // Ler a imagem do disco
      const imagePath = path.join(__dirname, '../', mapImageUrl.replace('/uploads/', 'uploads/'));
      const imageBuffer = fs.readFileSync(imagePath);
      // Enviar prompt multimodal (texto + imagem)
      result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: imageBuffer.toString('base64'), mimeType: 'image/png' } }
      ]);
    } else {
      // Apenas texto
      result = await model.generateContent(prompt);
    }
    console.log('[GEMINI] Resposta bruta:', JSON.stringify(result));
    let resposta = '';
    if (result && result.response) {
      if (typeof result.response.text === 'function') {
        resposta = result.response.text();
      } else if (typeof result.response.text === 'string') {
        resposta = result.response.text;
      } else if (result.response.candidates && result.response.candidates[0]?.content?.parts[0]?.text) {
        resposta = result.response.candidates[0].content.parts[0].text;
      }
    }
    if (!resposta) {
      resposta = 'Não foi possível obter resposta da IA.\nDEBUG: ' + JSON.stringify(result);
    }
    // Após obter a resposta do Gemini, filtrar símbolos proibidos
    if (typeof resposta === 'string') {
      resposta = resposta.replace(/[\*#_,\[\]\{\}\/\\\.,]/g, '');
    }
    // Substituir resposta padrão do Gemini por identidade da PNA
    if (typeof resposta === 'string' && (resposta.toLowerCase().includes('modelo de linguagem grande') || resposta.toLowerCase().includes('google'))) {
      resposta = 'Sou o assistente virtual da PNA (Polícia Nacional de Angola). Estou aqui para ajudar você!';
    }
    res.json({ resposta });
  } catch (error) {
    console.error('[GEMINI] Erro detalhado:', error);
    res.status(500).json({ error: 'Erro ao consultar IA Gemini', detalhe: error?.message || error });
  }
});

// Endpoint para upload de imagem de mapa
router.post('/upload-map-image', upload.single('mapImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  }
  // Retornar o caminho relativo para uso posterior
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Rota para buscar detalhes completos de um alerta por ID
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar alerta principal
    const alertaResult = await db.query(`
      SELECT a.*, 
             u.nome_completo as user_nome,
             u.bilhete_identidade as user_bi,
             u.telefone as user_telefone,
             u.contacto_familiar as contacto_familiar,
             u.municipio as user_municipio,
             u.bairro as user_bairro,
             up.nome as unidade_atribuida_nome
      FROM alertas a
      JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN unidades_policiais up ON a.unidade_atribuida_id = up.id
      WHERE a.id = $1
      LIMIT 1
    `, [id]);
    if (!alertaResult.rows.length) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }
    const alerta = alertaResult.rows[0];
    // Buscar nome do policial atribuído, se houver
    if (alerta.policial_atribuido_id) {
      const policialResult = await db.query('SELECT nome_completo FROM usuarios WHERE id = $1', [alerta.policial_atribuido_id]);
      if (policialResult.rows && policialResult.rows.length > 0) {
        alerta.policial_atribuido_nome = policialResult.rows[0].nome_completo;
      }
    }
    res.json(alerta);
  } catch (error) {
    console.error('Erro ao buscar alerta por ID:', error);
    res.status(500).json({ error: 'Erro ao buscar alerta por ID' });
  }
});

module.exports = router; 