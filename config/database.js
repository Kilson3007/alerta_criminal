const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'alerta_criminal',
  password: 'kilson',
  port: 5432,
});

// Função para executar queries
const query = async (text, params) => {
  console.log('📊 Query:', { text, params });
  try {
    const result = await pool.query(text, params);
    console.log('✅ Query executada com sucesso');
    return result;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

// Funções de busca de usuário
const findUserByPhone = async (telefone) => {
  // Tenta encontrar o usuário com o telefone exato primeiro
  let result = await query(
    'SELECT * FROM usuarios WHERE telefone = $1',
    [telefone]
  );

  // Se não encontrou e o telefone começa com '+244', tenta sem o '+244'
  if (result.rows.length === 0 && telefone.startsWith('+244')) {
    const telefoneSemPrefixo = telefone.substring(4); // Remove '+244'
    console.log(`Debug DB: Tentando buscar por telefone sem prefixo: ${telefoneSemPrefixo}`);
    result = await query(
      'SELECT * FROM usuarios WHERE telefone = $1',
      [telefoneSemPrefixo]
    );
  }

  // Se não encontrou e o telefone NÃO começa com '+244', tenta com o '+244'
  if (result.rows.length === 0 && !telefone.startsWith('+244')) {
    const telefoneComPrefixo = '+244' + telefone; // Adiciona '+244'
    console.log(`Debug DB: Tentando buscar por telefone com prefixo: ${telefoneComPrefixo}`);
    result = await query(
      'SELECT * FROM usuarios WHERE telefone = $1',
      [telefoneComPrefixo]
    );
  }

  return result.rows[0] || null;
};

const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

const findUserByNIP = async (nip) => {
  const result = await query(
    'SELECT * FROM usuarios WHERE nip = $1',
    [nip]
  );
  return result.rows[0] || null;
};

const findUserByID = async (id) => {
  const result = await query(
    'SELECT * FROM usuarios WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

// Função de inicialização
const initialize = async () => {
  try {
    // Criar tabelas se não existirem
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nip VARCHAR(20) UNIQUE,
        bilhete_identidade VARCHAR(20) UNIQUE,
        nome_completo VARCHAR(100) NOT NULL,
        telefone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        tipo_usuario VARCHAR(20) NOT NULL,
        senha VARCHAR(100) NOT NULL,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        bairro VARCHAR(100),
        rua VARCHAR(100),
        municipio VARCHAR(100),
        numero_casa VARCHAR(20),
        contacto_familiar VARCHAR(100),
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sessoes_usuario (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usuarios(id),
        token_hash VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        expira_em TIMESTAMP NOT NULL,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS alertas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        policial_atribuido_id INTEGER REFERENCES usuarios(id),
        unidade_atribuida_id INTEGER REFERENCES unidades_policiais(id),
        tipo VARCHAR(20),
        descricao TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        status VARCHAR(20) DEFAULT 'novo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS unidades_policiais (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        codigo_unidade VARCHAR(20) UNIQUE NOT NULL,
        endereco TEXT,
        telefone VARCHAR(20),
        localizacao_lat DECIMAL(10,8),
        localizacao_lng DECIMAL(11,8),
        ativa BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de logs de auditoria
    await query(`
      CREATE TABLE IF NOT EXISTS logs_auditoria (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        acao VARCHAR(50) NOT NULL,
        tabela VARCHAR(50) NOT NULL,
        registro_id INTEGER,
        dados_anteriores JSONB,
        dados_novos JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Banco de dados inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  initialize,
  findUserByPhone,
  findUserByEmail,
  findUserByNIP,
  findUserByID,
  end: () => pool.end()
}; 