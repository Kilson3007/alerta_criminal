const db = require('../config/database');

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...');
    
    // Verificar se a tabela existe
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela usuarios não existe!');
      return;
    }
    
    console.log('✅ Tabela usuarios existe');
    
    // Contar usuários
    const countResult = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsers = countResult.rows[0].total;
    console.log(`📊 Total de usuários: ${totalUsers}`);
    
    if (totalUsers > 0) {
      // Listar todos os usuários
      const usersResult = await db.query(`
        SELECT 
          id, 
          nome_completo, 
          telefone, 
          nip, 
          tipo_usuario, 
          ativo,
          criado_em
        FROM usuarios 
        ORDER BY criado_em DESC
      `);
      
      console.log('\n📋 Lista de usuários:');
      usersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nome_completo}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Telefone: ${user.telefone}`);
        console.log(`   NIP: ${user.nip || 'N/A'}`);
        console.log(`   Tipo: ${user.tipo_usuario}`);
        console.log(`   Ativo: ${user.ativo ? 'Sim' : 'Não'}`);
        console.log(`   Criado em: ${user.criado_em}`);
        console.log('');
      });
    } else {
      console.log('⚠️ Nenhum usuário encontrado no banco de dados!');
      console.log('💡 Execute o script init-db.js para criar usuários de teste');
    }
    
    // Verificar estrutura da tabela
    console.log('🔧 Verificando estrutura da tabela...');
    const structureResult = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela usuarios:');
    structureResult.rows.forEach(column => {
      console.log(`   ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers(); 