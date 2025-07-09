const express = require('express');
const db = require('../config/database');
const { auth, apenasOperacional, apenasAdmin } = require('../middleware/auth');
const { validarCoordendasLuanda } = require('../utils/validators');
const bcrypt = require('bcryptjs');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Obter perfil do usuário logado
router.get('/profile', auth, async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT 
        id, nip, bilhete_identidade, nome_completo, telefone, email,
        tipo_usuario, endereco, localizacao_lat, localizacao_lng,
        municipio, ativo, criado_em
      FROM usuarios 
      WHERE id = $1
    `, [req.user.userId]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const usuario = resultado.rows[0];
    
    // Remover dados sensíveis
    delete usuario.senha;

    res.json({
      message: 'Perfil obtido com sucesso',
      usuario
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar localização do usuário
router.put('/location', auth, async (req, res) => {
  try {
    const { latitude, longitude, endereco } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude e longitude são obrigatórias'
      });
    }

    // Validar se as coordenadas estão em Luanda
    if (!validarCoordendasLuanda(latitude, longitude)) {
      return res.status(400).json({
        error: 'Coordenadas fora da área de cobertura (Luanda)'
      });
    }

    await db.query(`
      UPDATE usuarios 
      SET localizacao_lat = $1, localizacao_lng = $2, endereco = $3, atualizado_em = NOW()
      WHERE id = $4
    `, [latitude, longitude, endereco, req.user.userId]);

    res.json({
      message: 'Localização atualizada com sucesso',
      localizacao: {
        latitude,
        longitude,
        endereco
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar unidades policiais próximas
router.get('/nearby-units', auth, async (req, res) => {
  try {
    const { latitude, longitude, raio = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude e longitude são obrigatórias'
      });
    }

    // Calcular unidades próximas usando fórmula de distância
    const resultado = await db.query(`
      SELECT 
        id, nome, codigo_unidade, endereco, telefone,
        localizacao_lat, localizacao_lng,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(localizacao_lat)) *
            cos(radians(localizacao_lng) - radians($2)) +
            sin(radians($1)) * sin(radians(localizacao_lat))
          )
        ) AS distancia_km
      FROM unidades_policiais
      WHERE ativa = true
      HAVING distancia_km <= $3
      ORDER BY distancia_km ASC
      LIMIT 10
    `, [latitude, longitude, raio]);

    res.json({
      message: 'Unidades próximas encontradas',
      unidades: resultado.rows,
      total: resultado.rows.length
    });

  } catch (error) {
    console.error('Erro ao buscar unidades próximas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar agentes próximos (apenas para operacionais)
router.get('/nearby-agents', auth, apenasOperacional, async (req, res) => {
  try {
    const { latitude, longitude, raio = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude e longitude são obrigatórias'
      });
    }

    const resultado = await db.query(`
      SELECT 
        id, nome_completo, telefone, tipo_usuario,
        localizacao_lat, localizacao_lng,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(localizacao_lat)) *
            cos(radians(localizacao_lng) - radians($2)) +
            sin(radians($1)) * sin(radians(localizacao_lat))
          )
        ) AS distancia_km
      FROM usuarios
      WHERE tipo_usuario = 'policia' 
        AND ativo = true 
        AND localizacao_lat IS NOT NULL 
        AND localizacao_lng IS NOT NULL
      HAVING distancia_km <= $3
      ORDER BY distancia_km ASC
      LIMIT 20
    `, [latitude, longitude, raio]);

    res.json({
      message: 'Agentes próximos encontrados',
      agentes: resultado.rows,
      total: resultado.rows.length
    });

  } catch (error) {
    console.error('Erro ao buscar agentes próximos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar perfil do usuário
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      nome_completo, 
      telefone, 
      email, 
      endereco 
    } = req.body;

    // Validar se pelo menos um campo foi fornecido
    if (!nome_completo && !telefone && !email && !endereco) {
      return res.status(400).json({
        error: 'Pelo menos um campo deve ser fornecido para atualização'
      });
    }

    // Construir query dinamicamente
    const campos = [];
    const valores = [];
    let contador = 1;

    if (nome_completo) {
      campos.push(`nome_completo = $${contador}`);
      valores.push(nome_completo);
      contador++;
    }

    if (telefone) {
      campos.push(`telefone = $${contador}`);
      valores.push(telefone);
      contador++;
    }

    if (email) {
      campos.push(`email = $${contador}`);
      valores.push(email);
      contador++;
    }

    if (endereco) {
      campos.push(`endereco = $${contador}`);
      valores.push(endereco);
      contador++;
    }

    campos.push(`atualizado_em = NOW()`);
    valores.push(req.user.userId);

    const query = `
      UPDATE usuarios 
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING id, nome_completo, telefone, email, endereco
    `;

    const resultado = await db.query(query, valores);

    res.json({
      message: 'Perfil atualizado com sucesso',
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para obter dados anteriores do usuário
const getDadosAnteriores = async (userId) => {
    const resultado = await db.query(`
        SELECT 
            id, nip, bilhete_identidade, nome_completo, telefone, email,
            tipo_usuario, bairro, rua, municipio, numero_casa, ativo
        FROM usuarios 
        WHERE id = $1
    `, [userId]);
    return resultado.rows[0];
};

// Listar todos os usuários (apenas admin) com paginação
router.get('/admin/users', auth, apenasAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const tipo = req.query.tipo || '';
        const status = req.query.status || '';

        // Construir query base
        let query = `
            FROM usuarios 
            WHERE 1=1
        `;
        const params = [];

        // Adicionar filtros
        if (search) {
            query += ` AND (
                nip ILIKE $${params.length + 1} OR
                bilhete_identidade ILIKE $${params.length + 1}
            )`;
            params.push(`%${search}%`);
        }

        if (tipo) {
            query += ` AND tipo_usuario = $${params.length + 1}`;
            params.push(tipo);
        }

        if (status !== '') {
            query += ` AND ativo = $${params.length + 1}`;
            params.push(status === 'true');
        }

        // Contar total de registros
        const countResult = await db.query(`SELECT COUNT(*) ${query}`, params);
        const total = parseInt(countResult.rows[0].count);

        // Buscar dados paginados
        const dataQuery = `
            SELECT 
                id, nip, bilhete_identidade, nome_completo, telefone, email,
                tipo_usuario, ativo, criado_em, bairro, rua, municipio, numero_casa
            ${query}
            ORDER BY criado_em DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        params.push(limit, offset);

        const resultado = await db.query(dataQuery, params);

        res.json({
            message: 'Lista de usuários obtida com sucesso',
            usuarios: resultado.rows,
            paginacao: {
                total,
                pagina: page,
                limite: limit,
                total_paginas: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar novo usuário (apenas admin)
router.post('/admin/users', 
    auth, 
    apenasAdmin,
    auditLog('CREATE', 'usuarios'),
    async (req, res) => {
        try {
            const {
                nip,
                bilhete_identidade,
                nome_completo,
                telefone,
                email,
                senha,
                tipo_usuario,
                bairro,
                rua,
                municipio,
                numero_casa
            } = req.body;

            // Validar campos obrigatórios
            if (!nip || !bilhete_identidade || !nome_completo || !senha || !tipo_usuario) {
                return res.status(400).json({
                    error: 'Campos obrigatórios: nip, bilhete_identidade, nome_completo, senha, tipo_usuario'
                });
            }

            // Verificar se NIP já existe
            const nipExistente = await db.query(
                'SELECT id FROM usuarios WHERE nip = $1',
                [nip]
            );

            if (nipExistente.rows.length > 0) {
                return res.status(400).json({
                    error: 'NIP já cadastrado'
                });
            }

            // Impedir registro de cidadãos pelo admin
            if (tipo_usuario === 'cidadao') {
                return res.status(403).json({
                    error: 'O registro de cidadãos só pode ser feito pelo app mobile.'
                });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
            const senhaHash = await bcrypt.hash(senha, salt);

            // Inserir usuário
            const resultado = await db.query(`
                INSERT INTO usuarios (
                    nip, bilhete_identidade, nome_completo, telefone, email,
                    senha, tipo_usuario, bairro, rua, municipio, numero_casa
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id, nip, nome_completo, tipo_usuario
            `, [
                nip, bilhete_identidade, nome_completo, telefone, email,
                senhaHash, tipo_usuario, bairro, rua, municipio, numero_casa
            ]);

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                usuario: resultado.rows[0]
            });

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

// Excluir usuário (apenas admin)
router.delete('/admin/users/:id', auth, apenasAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ message: 'Usuário excluído com sucesso', usuarioId: id });

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar usuário (apenas admin)
router.put('/admin/users/:id', 
    auth, 
    apenasAdmin,
    auditLog('UPDATE', 'usuarios', getDadosAnteriores),
    async (req, res) => {
        try {
            const { id } = req.params;
            const {
                nome_completo,
                telefone,
                email,
                tipo_usuario,
                bairro,
                rua,
                municipio,
                numero_casa,
                ativo
            } = req.body;

            // Construir query dinamicamente
            const campos = [];
            const valores = [];
            let contador = 1;

            if (nome_completo) {
                campos.push(`nome_completo = $${contador}`);
                valores.push(nome_completo);
                contador++;
            }

            if (telefone) {
                campos.push(`telefone = $${contador}`);
                valores.push(telefone);
                contador++;
            }

            if (email) {
                campos.push(`email = $${contador}`);
                valores.push(email);
                contador++;
            }

            if (tipo_usuario) {
                campos.push(`tipo_usuario = $${contador}`);
                valores.push(tipo_usuario);
                contador++;
            }

            if (bairro) {
                campos.push(`bairro = $${contador}`);
                valores.push(bairro);
                contador++;
            }

            if (rua) {
                campos.push(`rua = $${contador}`);
                valores.push(rua);
                contador++;
            }

            if (municipio) {
                campos.push(`municipio = $${contador}`);
                valores.push(municipio);
                contador++;
            }

            if (numero_casa) {
                campos.push(`numero_casa = $${contador}`);
                valores.push(numero_casa);
                contador++;
            }

            if (ativo !== undefined) {
                campos.push(`ativo = $${contador}`);
                valores.push(ativo);
                contador++;
            }

            if (campos.length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo fornecido para atualização'
                });
            }

            campos.push(`atualizado_em = NOW()`);
            valores.push(id);

            const query = `
                UPDATE usuarios 
                SET ${campos.join(', ')}
                WHERE id = $${contador}
                RETURNING id, nip, nome_completo, tipo_usuario, ativo
            `;

            const resultado = await db.query(query, valores);

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    error: 'Usuário não encontrado'
                });
            }

            res.json({
                message: 'Usuário atualizado com sucesso',
                usuario: resultado.rows[0]
            });

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

// Desativar/Ativar usuário (apenas admin)
router.patch('/admin/users/:id/status', 
    auth, 
    apenasAdmin,
    auditLog('UPDATE', 'usuarios', getDadosAnteriores),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { ativo } = req.body;

            if (ativo === undefined) {
                return res.status(400).json({
                    error: 'Campo "ativo" é obrigatório'
                });
            }

            const resultado = await db.query(`
                UPDATE usuarios 
                SET ativo = $1, atualizado_em = NOW()
                WHERE id = $2
                RETURNING id, nip, nome_completo, tipo_usuario, ativo
            `, [ativo, id]);

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    error: 'Usuário não encontrado'
                });
            }

            res.json({
                message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`,
                usuario: resultado.rows[0]
            });

        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

// Redefinir senha do usuário (apenas admin)
router.post('/admin/users/:id/reset-password', 
    auth, 
    apenasAdmin,
    auditLog('UPDATE', 'usuarios', getDadosAnteriores),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { nova_senha } = req.body;

            if (!nova_senha) {
                return res.status(400).json({
                    error: 'Nova senha é obrigatória'
                });
            }

            // Hash da nova senha
            const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
            const senhaHash = await bcrypt.hash(nova_senha, salt);

            const resultado = await db.query(`
                UPDATE usuarios 
                SET senha = $1, atualizado_em = NOW()
                WHERE id = $2
                RETURNING id, nip, nome_completo
            `, [senhaHash, id]);

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    error: 'Usuário não encontrado'
                });
            }

            res.json({
                message: 'Senha redefinida com sucesso',
                usuario: resultado.rows[0]
            });

        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

// Buscar logs de auditoria de um usuário (apenas admin)
router.get('/admin/users/:id/logs', auth, apenasAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(`
            SELECT 
                l.*,
                u.nome_completo as usuario_nome
            FROM logs_auditoria l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            WHERE l.registro_id = $1
            ORDER BY l.criado_em DESC
            LIMIT 100
        `, [id]);

        res.json({
            message: 'Logs de auditoria obtidos com sucesso',
            logs: resultado.rows
        });

    } catch (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar unidades policiais (apenas para operacionais)
router.get('/police-units', auth, apenasOperacional, async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT 
        id,
        nome,
        codigo_unidade,
        endereco,
        telefone,
        localizacao_lat,
        localizacao_lng,
        ativa,
        criado_em
      FROM unidades_policiais
      WHERE ativa = true
      ORDER BY nome ASC
    `);

    res.json({
      message: 'Unidades policiais obtidas com sucesso',
      units: resultado.rows
    });

  } catch (error) {
    console.error('Erro ao buscar unidades policiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === CRUD de Unidades Policiais (apenas admin) ===

// Criar nova unidade policial
router.post('/admin/units', auth, apenasAdmin, async (req, res) => {
  try {
    const { nome, codigo_unidade, telefone, endereco, localizacao_lat, localizacao_lng } = req.body;
    if (!nome || !codigo_unidade || !telefone || !endereco || !localizacao_lat || !localizacao_lng) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const resultado = await db.query(
      `INSERT INTO unidades_policiais (nome, codigo_unidade, telefone, endereco, localizacao_lat, localizacao_lng, ativa, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW()) RETURNING *`,
      [nome, codigo_unidade, telefone, endereco, localizacao_lat, localizacao_lng]
    );
    res.status(201).json({ message: 'Unidade criada com sucesso', unidade: resultado.rows[0] });
  } catch (error) {
    console.error('Erro ao criar unidade policial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Editar unidade policial
router.put('/admin/units/:id', auth, apenasAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, endereco, localizacao_lat, localizacao_lng, ativa } = req.body;
    const campos = [];
    const valores = [];
    let contador = 1;
    if (nome) { campos.push(`nome = $${contador++}`); valores.push(nome); }
    if (telefone) { campos.push(`telefone = $${contador++}`); valores.push(telefone); }
    if (endereco) { campos.push(`endereco = $${contador++}`); valores.push(endereco); }
    if (localizacao_lat) { campos.push(`localizacao_lat = $${contador++}`); valores.push(localizacao_lat); }
    if (localizacao_lng) { campos.push(`localizacao_lng = $${contador++}`); valores.push(localizacao_lng); }
    if (ativa !== undefined) { campos.push(`ativa = $${contador++}`); valores.push(ativa); }
    if (campos.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo fornecido para atualização' });
    }
    valores.push(id);
    const query = `UPDATE unidades_policiais SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;
    const resultado = await db.query(query, valores);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }
    res.json({ message: 'Unidade atualizada com sucesso', unidade: resultado.rows[0] });
  } catch (error) {
    console.error('Erro ao editar unidade policial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover unidade policial
router.delete('/admin/units/:id', auth, apenasAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await db.query('DELETE FROM unidades_policiais WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }
    res.json({ message: 'Unidade removida com sucesso', unidade: resultado.rows[0] });
  } catch (error) {
    console.error('Erro ao remover unidade policial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 