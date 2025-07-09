const db = require('../config/database');

async function fixDatabase() {
  try {
    console.log('🔧 Iniciando correção do banco de dados...');

    // 1. Verificar e corrigir tabela alertas
    console.log('📋 Verificando tabela alertas...');
    
    // Verificar se a coluna created_at existe
    try {
      await db.query('SELECT created_at FROM alertas LIMIT 1');
      console.log('✅ Coluna created_at existe na tabela alertas');
    } catch (error) {
      if (error.code === '42703') { // Coluna não existe
        console.log('❌ Coluna created_at não existe, adicionando...');
        await db.query('ALTER TABLE alertas ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Coluna created_at adicionada');
      } else {
        throw error;
      }
    }

    // Verificar se a coluna updated_at existe
    try {
      await db.query('SELECT updated_at FROM alertas LIMIT 1');
      console.log('✅ Coluna updated_at existe na tabela alertas');
    } catch (error) {
      if (error.code === '42703') { // Coluna não existe
        console.log('❌ Coluna updated_at não existe, adicionando...');
        await db.query('ALTER TABLE alertas ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Coluna updated_at adicionada');
      } else {
        throw error;
      }
    }

    // 2. Verificar e corrigir tabela usuarios
    console.log('📋 Verificando tabela usuarios...');
    
    // Verificar se a coluna numero_casa existe
    try {
      await db.query('SELECT numero_casa FROM usuarios LIMIT 1');
      console.log('✅ Coluna numero_casa existe na tabela usuarios');
    } catch (error) {
      if (error.code === '42703') { // Coluna não existe
        console.log('❌ Coluna numero_casa não existe, adicionando...');
        await db.query('ALTER TABLE usuarios ADD COLUMN numero_casa VARCHAR(20)');
        console.log('✅ Coluna numero_casa adicionada');
      } else {
        throw error;
      }
    }

    // Verificar se a coluna atualizado_em existe
    try {
      await db.query('SELECT atualizado_em FROM usuarios LIMIT 1');
      console.log('✅ Coluna atualizado_em existe na tabela usuarios');
    } catch (error) {
      if (error.code === '42703') { // Coluna não existe
        console.log('❌ Coluna atualizado_em não existe, adicionando...');
        await db.query('ALTER TABLE usuarios ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Coluna atualizado_em adicionada');
      } else {
        throw error;
      }
    }

    // 3. Criar tabela de histórico de alertas se não existir
    console.log('📋 Verificando tabela alertas_historico...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS alertas_historico (
        id SERIAL PRIMARY KEY,
        alerta_id INTEGER REFERENCES alertas(id),
        usuario_id INTEGER REFERENCES usuarios(id),
        status_anterior VARCHAR(20),
        status_novo VARCHAR(20),
        observacao TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela alertas_historico verificada/criada');

    // 4. Adicionar índices para melhor performance
    console.log('📋 Adicionando índices...');
    
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas(status)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_alertas_created_at ON alertas(created_at)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios(telefone)');
      console.log('✅ Índices criados/verificados');
    } catch (error) {
      console.log('⚠️ Erro ao criar índices:', error.message);
    }

    console.log('✅ Correção do banco de dados concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao corrigir banco de dados:', error);
    process.exit(1);
  }
}

fixDatabase(); 