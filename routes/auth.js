const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const db = require('../config/database');
const { validarNIP, validarBI } = require('../utils/validators');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rota simplificada para teste
router.get('/test', (req, res) => {
  res.json({ message: 'Autenticação funcionando!' });
});

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    console.log('➡️ Dados recebidos para registro:', req.body);
    const { nome_completo, email, telefone, senha, tipo_usuario, nip, bilhete_identidade, contacto_familiar, bairro, rua, municipio, numero_casa } = req.body;

    // 1. Validação básica de entrada
    if (!nome_completo || !telefone || !senha || !tipo_usuario) {
      return res.status(400).json({ error: 'Nome completo, telefone, senha e tipo de usuário são obrigatórios.' });
    }

    if (!validator.isMobilePhone(telefone, 'any', { strictMode: false })) {
      return res.status(400).json({ error: 'Formato de telefone inválido.' });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido.' });
    }

    if (nip && !validarNIP(nip)) { // Assuming validarNIP is available in utils/validators
      return res.status(400).json({ error: 'Formato de NIP inválido.' });
    }

    if (bilhete_identidade && !validarBI(bilhete_identidade)) { // Assuming validarBI is available in utils/validators
      return res.status(400).json({ error: 'Formato de Bilhete de Identidade inválido.' });
    }

    // 2. Verificar se o usuário já existe
    const existingUserByPhone = await db.findUserByPhone(telefone);
    if (existingUserByPhone) {
      return res.status(409).json({ error: 'Telefone já cadastrado.' });
    }
    if (email) {
      const existingUserByEmail = await db.findUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({ error: 'Email já cadastrado.' });
      }
    }
    if (nip) {
      const existingUserByNIP = await db.findUserByNIP(nip);
      if (existingUserByNIP) {
        return res.status(409).json({ error: 'NIP já cadastrado.' });
      }
    }
    // No need to check for existing BI as it's optional and will be handled by UNIQUE constraint if provided

    // 3. Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // 4. Inserir usuário no banco de dados
    const queryText = `
      INSERT INTO usuarios (
        bilhete_identidade, 
        nome_completo, 
        telefone, 
        email, 
        tipo_usuario, 
        senha,
        nip,
        contacto_familiar,
        bairro,
        rua,
        municipio,
        numero_casa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
    const queryParams = [
      bilhete_identidade,
      nome_completo,
      telefone,
      email,
      tipo_usuario,
      senhaHash,
      nip,
      contacto_familiar,
      bairro,
      rua,
      municipio,
      numero_casa
    ];

    const result = await db.query(queryText, queryParams);
    const newUser = result.rows[0];

    // 5. Gerar token JWT para o novo usuário (opcional, mas bom para login automático após registro)
    const token = jwt.sign(
      { userId: newUser.id, tipo: newUser.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      token,
      usuario: {
        id: newUser.id,
        nome_completo: newUser.nome_completo,
        email: newUser.email,
        telefone: newUser.telefone,
        tipo_usuario: newUser.tipo_usuario,
        nip: newUser.nip,
        bilhete_identidade: newUser.bilhete_identidade,
        ativo: newUser.ativo
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro de usuário:', error);
    if (error.code === '23505') { // PostgreSQL unique violation error code
        if (error.detail.includes('telefone')) return res.status(409).json({ error: 'Telefone já cadastrado.' });
        if (error.detail.includes('email')) return res.status(409).json({ error: 'Email já cadastrado.' });
        if (error.detail.includes('nip')) return res.status(409).json({ error: 'NIP já cadastrado.' });
        if (error.detail.includes('bilhete_identidade')) return res.status(409).json({ error: 'Bilhete de Identidade já cadastrado.' });
    }
    if (error.detail && error.detail.includes('nome_completo')) {
        // Handle error based on 'nome_completo' being the target column
        // This specific check might not be needed if the column name is correctly updated in DB and query.
        // It's more of a fallback for unique constraint violation on a renamed column
    }
    res.status(500).json({ error: 'Erro interno do servidor durante o registro.' });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    console.log('📲 Tentativa de login:', req.body);
    const { identifier, senha } = req.body; // Agora recebe 'identifier'
    
    if (!identifier || !senha) {
      console.log('❌ Login falhou: Identificador ou senha não fornecidos');
      return res.status(400).json({ error: 'Telefone/NIP e senha são obrigatórios' });
    }
    
    // Verificar qual método de login está sendo usado (telefone ou NIP)
    let usuario;
    let metodoLogin = 'desconhecido';
    
    // Tentar como telefone primeiro
    // Ajusta o regex para permitir o sinal de mais (+) no início, se presente.
    // A validação de comprimento deve ser ajustada para incluir o código do país se ele for sempre incluído.
    const isPhoneNumber = /^\+?[0-9]+$/.test(identifier) && identifier.length >= 7 && identifier.length <= 15; // Ajustei o regex para permitir o '+'

    if (isPhoneNumber) {
      console.log(`🔍 Buscando usuário por telefone: ${identifier}`);
      metodoLogin = 'telefone';
      // Remove o '+' e o código do país (244) se presente, antes de buscar no banco de dados.
      let cleanIdentifier = identifier;
      if (identifier.startsWith('+244')) {
        cleanIdentifier = identifier.substring(4); // Remove '+244'
      } else if (identifier.startsWith('+')) {
        cleanIdentifier = identifier.substring(1); // Remove apenas o '+'
      }
      usuario = await db.findUserByPhone(cleanIdentifier);
    }

    // Se não encontrou por telefone ou não parece um telefone, tentar como NIP
    if (!usuario) {
      console.log(`🔍 Buscando usuário por NIP: ${identifier}`);
      metodoLogin = 'nip';
      usuario = await db.findUserByNIP(identifier);
    }

    if (!usuario) {
      console.log(`❌ Login falhou: Usuário não encontrado com ${metodoLogin}`);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    console.log(`✅ Usuário encontrado: ${usuario.nome_completo} (${usuario.tipo || usuario.tipo_usuario})`);
    
    // Verificar senha
    console.log(`🔐 Verificando senha para ${usuario.nome_completo}`);
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaCorreta) {
      console.log('❌ Login falhou: Senha incorreta');
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    // Gerar token JWT
    console.log('🔑 Gerando token JWT');
    const token = jwt.sign(
      { userId: usuario.id, tipo: usuario.tipo || usuario.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Retornar resposta com dados do usuário
    console.log('✅ Login realizado com sucesso!');
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: usuario.id,
        nip: usuario.nip,
        nome_completo: usuario.nome_completo,
        telefone: usuario.telefone,
        email: usuario.email,
        tipo: usuario.tipo || usuario.tipo_usuario,
        tipo_usuario: usuario.tipo_usuario || usuario.tipo,
        ativo: usuario.ativo
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no login de usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor durante o login.' });
  }
});

// Logout - usando função normal ao invés de async
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Verificar token
router.get('/verify', auth, (req, res) => {
  res.json({
    valid: true,
    usuario: req.user
  });
});

module.exports = router; 