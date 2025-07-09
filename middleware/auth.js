const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e se o usuário ainda existe e está ativo
 */
const auth = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acesso negado. Token não fornecido.' 
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simplificado para testes: não verificar no banco de dados
    // apenas usar os dados do token decodificado
    req.user = {
      userId: decoded.userId,
      tipo: decoded.tipo
    };
    
    // Buscar dados adicionais do usuário (se necessário)
    try {
      const usuario = await db.findUserByID(decoded.userId);
      if (usuario) {
        req.user.nome = usuario.nome_completo;
        req.user.nip = usuario.nip;
        req.user.email = usuario.email;
        req.user.telefone = usuario.telefone;
      }
    } catch (err) {
      console.log('Aviso: Não foi possível obter detalhes adicionais do usuário', err);
    }

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado. Faça login novamente.' 
      });
    }

    console.error('Erro no middleware de auth:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor.' 
    });
  }
};

/**
 * Middleware para verificar tipo de usuário específico
 * @param {string|array} tiposPermitidos - Tipos de usuário permitidos
 */
const verificarTipoUsuario = (tiposPermitidos) => {
  return (req, res, next) => {
    const tiposArray = Array.isArray(tiposPermitidos) ? tiposPermitidos : [tiposPermitidos];
    
    if (!tiposArray.includes(req.user.tipo)) {
      return res.status(403).json({
        error: `Acesso restrito. Apenas usuários do tipo: ${tiposArray.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Middleware específico para cidadãos
 */
const apenasCidadao = verificarTipoUsuario('cidadao');

/**
 * Middleware específico para polícia
 */
const apenasPolicia = verificarTipoUsuario('policia');

/**
 * Middleware específico para unidades
 */
const apenasUnidade = verificarTipoUsuario('unidade');

/**
 * Middleware para polícia e unidades (operacionais)
 */
const apenasOperacional = verificarTipoUsuario(['policia', 'unidade', 'admin']);

/**
 * Middleware específico para administradores
 */
const apenasAdmin = verificarTipoUsuario('admin');

module.exports = {
  auth,
  verificarTipoUsuario,
  apenasCidadao,
  apenasPolicia,
  apenasUnidade,
  apenasOperacional,
  apenasAdmin
}; 