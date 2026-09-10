const { Client } = require('pg');

module.exports = async (req, res) => {
    // Apenas permitimos o método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let client;
    try {
        const formDataObj = req.body;
        
        // 1. Determinar a tabela com base no assunto original antes de deletar
        const subject = formDataObj['_subject'] || '';
        let tableName = '';
        if (subject.includes('Orçamento de Identidade Visual')) tableName = 'orcamentos_identidade_visual';
        else if (subject.includes('Orçamento de Gerenciamento de Instagram')) tableName = 'orcamentos_gerenciamento_instagram';
        else if (subject.includes('Orçamento')) tableName = 'orcamentos_identidade_visual'; // fallback
        else if (subject.includes('Briefing')) tableName = 'briefings_identidade_visual';
        else if (subject.includes('Consultoria')) tableName = 'consultorias_posicionamento';
        else tableName = 'onboarding_respostas'; // default

        // Remover campos desnecessários
        delete formDataObj['_subject'];
        delete formDataObj['_gotcha'];

        // 2. Conectar ao Neon Postgres
        const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';
        
        client = new Client({ connectionString });
        await client.connect();

        // Inserir os dados no campo JSONB da tabela correta
        const query = `
            INSERT INTO ${tableName} (dados_completos) 
            VALUES ($1) 
            RETURNING id
        `;
        
        await client.query(query, [JSON.stringify(formDataObj)]);

        // 3. Chamar Webhook do Make.com (Se configurado)
        const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
        
        if (makeWebhookUrl) {
            try {
                await fetch(makeWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formDataObj)
                });
            } catch (webhookError) {
                console.error("Make Webhook Error:", webhookError);
            }
        }

        // Sucesso
        res.status(200).json({ success: true, message: 'Dados salvos com sucesso!' });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, error: error.message || 'Erro interno no servidor' });
    } finally {
        if (client) {
            try {
                await client.end();
            } catch (e) {
                // ignore
            }
        }
    }
};
