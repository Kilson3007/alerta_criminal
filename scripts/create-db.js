const { Client } = require('pg');

async function createDatabase() {
  // Conectar ao banco de dados postgres (banco padrão)
  const client = new Client({
    user: process.env.DB_ADMIN_USER || 'postgres',
    host: process.env.DB_ADMIN_HOST || 'localhost',
    database: process.env.DB_ADMIN_DATABASE || 'postgres',
    password: process.env.DB_ADMIN_PASSWORD || 'kilson',
    port: process.env.DB_ADMIN_PORT ? parseInt(process.env.DB_ADMIN_PORT) : 5432,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Verificar se o banco já existe
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME || 'sistema_alerta'}'`
    );

    if (checkDb.rows.length === 0) {
      // Criar o banco de dados
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'sistema_alerta'}`);
      console.log(`✅ Banco de dados ${process.env.DB_NAME || 'sistema_alerta'} criado com sucesso`);
    } else {
      console.log(`ℹ️ Banco de dados ${process.env.DB_NAME || 'sistema_alerta'} já existe`);
    }

    await client.end();
    console.log('✅ Conexão encerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    await client.end();
    process.exit(1);
  }
}

createDatabase(); 