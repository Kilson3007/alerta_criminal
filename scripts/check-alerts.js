const db = require('../config/database');

async function checkAlerts() {
  try {
    console.log('🔍 Verificando alertas no banco de dados...');
    
    // Verificar todos os alertas
    const allAlerts = await db.query(`
      SELECT a.*, u.nome_completo as user_nome
      FROM alertas a
      JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.created_at DESC
    `);
    
    console.log('\n📊 Total de alertas:', allAlerts.rows.length);
    console.log('\n📝 Lista de alertas:');
    allAlerts.rows.forEach((alerta, index) => {
      console.log(`\nAlerta #${index + 1}:`);
      console.log('ID:', alerta.id);
      console.log('Usuário:', alerta.user_nome);
      console.log('Tipo:', alerta.tipo);
      console.log('Status:', alerta.status);
      console.log('Criado em:', alerta.created_at);
      console.log('Localização:', alerta.latitude, alerta.longitude);
    });
    
    // Verificar usuários
    const users = await db.query('SELECT * FROM usuarios');
    console.log('\n👥 Total de usuários:', users.rows.length);
    console.log('\n📝 Lista de usuários:');
    users.rows.forEach(user => {
      console.log(`\nUsuário #${user.id}:`);
      console.log('Nome:', user.nome_completo);
      console.log('Tipo:', user.tipo_usuario);
      console.log('Telefone:', user.telefone);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkAlerts(); 