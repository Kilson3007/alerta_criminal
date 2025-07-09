const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const updateOldAlertsStatus = require('./services/alertStatusUpdater');
require('dotenv').config();

// Configurar JWT_SECRET se não estiver definido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'seu_segredo_jwt_super_secreto_para_testes';
  console.log('⚠️ JWT_SECRET não definido no arquivo .env, usando valor padrão para testes');
}

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const configRoutes = require('./routes/config');
const trackingRoutes = require('./routes/tracking');
const socketHandler = require('./utils/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins, // Usar o mesmo array do Express para CORS
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware de Segurança
app.use(helmet({
  contentSecurityPolicy: false // Desabilitar para testes
}));

const allowedOrigins = [
  'https://alerta-criminal-1.onrender.com',
  'http://localhost:3000'
];

// CORS deve ser o PRIMEIRO middleware
app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use(limiter);

// Middleware do Express
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para debug de requisições
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tornar io disponível nas rotas
app.set('io', io);

// Configuração do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/config', configRoutes);
app.use('/api/tracking', trackingRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Sistema de Alerta Criminal - API Online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota principal - redirecionar para página de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para página de registro
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Rota para o dashboard
app.get('/dashboard.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rota para obter chave do Google Maps
app.get('/api/config/maps-key', (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

// Rota para obter alertas
app.get('/api/alerts', authenticateToken, (req, res) => {
  // Aqui você deve implementar a lógica para buscar alertas do banco de dados
  // Por enquanto, vamos retornar dados simulados
  const alerts = [
    {
      id: 1,
      tipo: 'emergencia',
      descricao: 'Alerta de emergência',
      latitude: -8.8147,
      longitude: 13.2302,
      user_nome: 'Usuário Teste',
      created_at: new Date()
    }
  ];
  
  res.json(alerts);
});

// Rota para criar alerta
app.post('/api/alerts', authenticateToken, (req, res) => {
  const alertData = req.body;
  
  // Aqui você deve implementar a lógica para salvar o alerta no banco de dados
  // Por enquanto, vamos apenas retornar os dados recebidos
  const newAlert = {
    id: Date.now(),
    ...alertData,
    user_nome: req.user.nome,
    created_at: new Date()
  };
  
  // Emitir evento para todos os clientes conectados
  io.emit('novo-alerta', newAlert);
  
  res.status(201).json(newAlert);
});

// Rota para atualizar localização
app.put('/api/alerts/location', authenticateToken, (req, res) => {
  const { latitude, longitude } = req.body;
  
  // Aqui você deve implementar a lógica para atualizar a localização no banco de dados
  // Por enquanto, vamos apenas emitir o evento
  io.emit('location-update', {
    userId: req.user.id,
    latitude,
    longitude
  });
  
  res.json({ success: true });
});

// Configurar Socket.io
socketHandler(io);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;

// Inicializar banco de dados e servidor
db.initialize()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚨 Sistema de Alerta Criminal iniciado na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Cobertura: Luanda, Angola`);
      console.log(`🔗 Acesse: http://localhost:${PORT}`);
      console.log(`🔗 Dashboard: http://localhost:${PORT}/dashboard.html`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao inicializar o banco de dados:', err);
    process.exit(1);
  });

// Agendar a tarefa para rodar a cada hora
cron.schedule('0 * * * *', () => {
  console.log('⏳ Executando tarefa agendada: atualização de status de alertas antigos');
  updateOldAlertsStatus();
});

module.exports = { app, server, io }; 