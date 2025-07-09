const { Client } = require('pg');

async function createDatabase() {
  // Conectar ao banco de dados postgres (banco padrão)
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'kilson',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Verificar se o banco já existe
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'sistema_alerta'"
    );

    if (checkDb.rows.length === 0) {
      // Criar o banco de dados
      await client.query('CREATE DATABASE sistema_alerta');
      console.log('✅ Banco de dados sistema_alerta criado com sucesso');
    } else {
      console.log('ℹ️ Banco de dados sistema_alerta já existe');
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