const db = require('../config/database');

async function fixData() {
  try {
    console.log('🔧 Corrigindo dados no banco...');
    
    // Atualizar nome do usuário
    await db.query(`
      UPDATE usuarios 
      SET nome_completo = 'João Silva'
      WHERE telefone = '+244928885660'
    `);
    
    console.log('✅ Nome do usuário atualizado');
    
    // Verificar se os alertas estão com o usuário correto
    const alerts = await db.query('SELECT * FROM alertas');
    for (const alert of alerts.rows) {
      // Atualizar usuário_id dos alertas para o usuário correto
      await db.query(`
        UPDATE alertas 
        SET usuario_id = 1
        WHERE id = $1
      `, [alert.id]);
    }
    
    console.log('✅ Alertas atualizados');
    
    // Verificar resultado
    const result = await db.query(`
      SELECT a.*, u.nome_completo as user_nome
      FROM alertas a
      JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.created_at DESC
    `);
    
    console.log('\n📊 Resultado final:');
    result.rows.forEach(alerta => {
      console.log(`\nAlerta #${alerta.id}:`);
      console.log('Usuário:', alerta.user_nome);
      console.log('Tipo:', alerta.tipo);
      console.log('Status:', alerta.status);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixData(); 