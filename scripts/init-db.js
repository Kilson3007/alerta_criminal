const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function initializeDatabase() {
  try {
    // Inicializar tabelas
    await db.initialize();
    
    // Criar senha hash
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Inserir usuários de teste
    await db.query(`
      INSERT INTO usuarios (
        nip, bilhete_identidade, nome_completo, telefone, email, 
        tipo_usuario, senha, ativo
      ) VALUES 
      (NULL, '123456789LA012', 'João Silva', '244912345678', 'joao@teste.ao', 
       'cidadao', $1, true),
      ('20001231123451', '987654321LA098', 'Pedro Agente', '244923456789', 'pedro@policia.ao', 
       'policia', $1, true),
      ('CPL001', NULL, 'Comando Provincial de Luanda', '244222334455', 'comando@policia.ao', 
       'unidade', $1, true)
      ON CONFLICT (telefone) DO NOTHING
    `, [hashedPassword]);
    
    // Inserir unidade policial
    await db.query(`
      INSERT INTO unidades_policiais (
        nome, codigo_unidade, endereco, telefone, 
        localizacao_lat, localizacao_lng, ativa
      ) VALUES (
        'Comando Provincial de Luanda', 'CPL001', 
        'Largo do Ambiente, Ingombota', '+244 222 334 455',
        -8.8147, 13.2302, true
      )
      ON CONFLICT (codigo_unidade) DO NOTHING
    `);
    
    console.log('✅ Dados iniciais inseridos com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase(); 