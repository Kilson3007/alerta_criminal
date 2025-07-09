const db = require('../config/database');

/**
 * Middleware para registrar logs de auditoria
 * @param {string} acao - Ação realizada (CREATE, UPDATE, DELETE, etc)
 * @param {string} tabela - Nome da tabela afetada
 * @param {function} getDadosAnteriores - Função para obter dados anteriores (opcional)
 */
const auditLog = (acao, tabela, getDadosAnteriores = null) => {
    return async (req, res, next) => {
        // Salvar a função original de res.json
        const originalJson = res.json;

        // Sobrescrever res.json para capturar a resposta
        res.json = async function(data) {
            try {
                const userId = req.user?.userId;
                const registroId = req.params.id || data?.id;
                let dadosAnteriores = null;
                let dadosNovos = null;

                // Obter dados anteriores se a função for fornecida
                if (getDadosAnteriores && registroId) {
                    dadosAnteriores = await getDadosAnteriores(registroId);
                }

                // Capturar dados novos baseado na ação
                if (acao === 'CREATE') {
                    dadosNovos = req.body;
                } else if (acao === 'UPDATE') {
                    dadosNovos = req.body;
                } else if (acao === 'DELETE') {
                    dadosNovos = { id: registroId };
                }

                // Registrar log de auditoria
                await db.query(`
                    INSERT INTO logs_auditoria (
                        usuario_id, acao, tabela, registro_id,
                        dados_anteriores, dados_novos,
                        ip_address, user_agent
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    userId,
                    acao,
                    tabela,
                    registroId,
                    dadosAnteriores,
                    dadosNovos,
                    req.ip,
                    req.headers['user-agent']
                ]);

            } catch (error) {
                console.error('Erro ao registrar log de auditoria:', error);
            }

            // Chamar a função original
            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = auditLog; 