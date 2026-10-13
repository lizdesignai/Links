const { Client } = require('pg');
const crypto = require('crypto');

module.exports = async (req, res) => {
    // Configura cabeçalhos CORS e JSON
    res.setHeader('Content-Type', 'application/json');

    const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';
    let client;

    try {
        // =====================================================================
        // 1. GET /api/draft?id=XXXXX - Recupera um rascunho salvo
        // =====================================================================
        if (req.method === 'GET') {
            const draftId = req.query ? req.query.id : null;
            if (!draftId) {
                return res.status(400).json({ success: false, error: 'ID do rascunho não informado.' });
            }

            client = new Client({
                connectionString,
                ssl: { rejectUnauthorized: false }
            });
            await client.connect();

            const result = await client.query(
                `SELECT id, form_id, form_path, current_step, dados, updated_at 
                 FROM formularios_rascunhos 
                 WHERE id = $1 
                 LIMIT 1`,
                [draftId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Rascunho não encontrado ou expirado.' });
            }

            return res.status(200).json({
                success: true,
                draft: result.rows[0]
            });
        }

        // =====================================================================
        // 2. POST /api/draft - Salva ou atualiza um rascunho
        // =====================================================================
        if (req.method === 'POST') {
            const body = req.body || {};
            let draftId = body.draft_id;

            // Se não tem ID prévio, gera um ID seguro e limpo de 10 caracteres
            if (!draftId || typeof draftId !== 'string' || draftId.trim() === '') {
                draftId = 'd_' + crypto.randomBytes(5).toString('hex');
            } else {
                draftId = draftId.trim();
            }

            const formId = body.form_id || 'form';
            const formPath = body.form_path || 'form';
            const currentStep = typeof body.current_step === 'number' ? body.current_step : 0;
            const dados = body.dados || {};

            // Extrai dados chave de contato se disponíveis para identificação
            let nome = null;
            let whatsapp = null;
            let email = null;
            let instagram = null;

            for (const key of Object.keys(dados)) {
                const lower = key.toLowerCase();
                if (!nome && (lower.includes('nome') || lower === 'name')) {
                    nome = String(dados[key]).substring(0, 255);
                }
                if (!whatsapp && (lower.includes('whatsapp') || lower.includes('telefone') || lower.includes('celular') || lower === 'phone')) {
                    whatsapp = String(dados[key]).substring(0, 64);
                }
                if (!email && (lower.includes('email') || lower.includes('e-mail'))) {
                    email = String(dados[key]).substring(0, 255);
                }
                if (!instagram && (lower.includes('instagram') || lower.includes('insta') || lower === '@')) {
                    instagram = String(dados[key]).substring(0, 128);
                }
            }

            const status = body.status || 'em_andamento';

            client = new Client({
                connectionString,
                ssl: { rejectUnauthorized: false }
            });
            await client.connect();

            const upsertQuery = `
                INSERT INTO formularios_rascunhos (id, form_id, form_path, current_step, nome, whatsapp, email, instagram, status, dados, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    current_step = EXCLUDED.current_step,
                    nome = COALESCE(EXCLUDED.nome, formularios_rascunhos.nome),
                    whatsapp = COALESCE(EXCLUDED.whatsapp, formularios_rascunhos.whatsapp),
                    email = COALESCE(EXCLUDED.email, formularios_rascunhos.email),
                    instagram = COALESCE(EXCLUDED.instagram, formularios_rascunhos.instagram),
                    status = CASE 
                        WHEN formularios_rascunhos.status = 'finalizado' THEN 'finalizado'
                        ELSE EXCLUDED.status
                    END,
                    dados = EXCLUDED.dados,
                    updated_at = NOW()
                RETURNING id;
            `;

            await client.query(upsertQuery, [
                draftId,
                formId,
                formPath,
                currentStep,
                nome,
                whatsapp,
                email,
                instagram,
                status,
                JSON.stringify(dados)
            ]);

            return res.status(200).json({
                success: true,
                draft_id: draftId
            });
        }

        // Método não suportado
        return res.status(405).json({ success: false, error: 'Método não permitido' });

    } catch (error) {
        console.error('API Draft Error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Erro interno no servidor' });
    } finally {
        if (client) {
            try {
                await client.end();
            } catch (e) {}
        }
    }
};
