const db = require('../config/database');

const updateOldAlertsStatus = async () => {
  try {
    console.log('🧹 Iniciando atualização de status de alertas antigos...');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const query = `
      UPDATE alertas
      SET status = $1, updated_at = NOW()
      WHERE created_at < $2 AND status = 'novo'
      RETURNING id
    `;
    const result = await db.query(query, ['expirado', twentyFourHoursAgo]);
    console.log(`✅ ${result.rowCount} alertas tiveram seu status alterado para 'expirado'.`);

  } catch (error) {
    console.error('❌ Erro ao atualizar status de alertas antigos:', error);
  }
};

module.exports = updateOldAlertsStatus; 