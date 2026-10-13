const { Client } = require('pg');

const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function listLeads() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Conectado ao Neon Postgres.\n");

        const query = `
            SELECT 
                id,
                form_path,
                current_step,
                nome,
                whatsapp,
                instagram,
                status,
                TO_CHAR(updated_at, 'DD/MM/YYYY HH24:MI') as ultima_atividade,
                TO_CHAR(concluido_em, 'DD/MM/YYYY HH24:MI') as finalizado_em
            FROM formularios_rascunhos
            ORDER BY updated_at DESC
            LIMIT 50;
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log("Nenhum rascunho ou lead registrado ainda.");
            return;
        }

        console.log("=== RELATÓRIO DE LEADS E RASCUNHOS REGISTRADOS ===");
        console.table(res.rows.map(r => ({
            "ID / Link": r.id,
            "Nome": r.nome || 'Não preenchido',
            "WhatsApp": r.whatsapp || '-',
            "Instagram": r.instagram || '-',
            "Formulário": r.form_path,
            "Etapa": r.current_step,
            "Status": r.status === 'finalizado' ? '✅ Finalizado' : '⏳ Em andamento / Abandonado',
            "Última Atividade": r.ultima_atividade
        })));

    } catch (err) {
        console.error("Erro ao consultar leads:", err);
    } finally {
        await client.end();
    }
}

listLeads();
