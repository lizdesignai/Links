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
        else if (subject.includes('Pesquisa de Satisfação - Identidade Visual')) tableName = 'pesquisa_satisfacao_idv';
        else if (subject.includes('Pesquisa de Satisfação - Gerenciamento de Instagram')) tableName = 'pesquisa_satisfacao_instagram';
        else if (subject.includes('Brand Experience Review')) tableName = 'brand_experience_review';
        else if (subject.includes('Raio-X do Instagram')) tableName = 'raiox_instagram';
        else if (subject.includes('Orçamento')) tableName = 'orcamentos_identidade_visual'; // fallback
        else if (subject.includes('Briefing')) tableName = 'briefings_identidade_visual';
        else if (subject.includes('Consultoria')) tableName = 'consultorias_posicionamento';
        else tableName = 'onboarding_respostas'; // default

        // Remover campos de controle
        delete formDataObj['_subject'];
        delete formDataObj['_gotcha'];

        // 2. Conectar ao Neon Postgres
        const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';
        
        client = new Client({ connectionString });
        await client.connect();

        // 3. Buscar colunas reais da tabela para preencher tanto as colunas individuais quanto dados_completos
        const colQuery = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name NOT IN ('id', 'created_at')",
            [tableName]
        );
        const validColumns = colQuery.rows.map(r => r.column_name);

        const insertCols = [];
        const insertVals = [];
        const placeholders = [];

        // Preencher cada coluna individual que bate com os campos do formulário
        for (const col of validColumns) {
            if (col === 'dados_completos') continue;
            
            const matchedKey = Object.keys(formDataObj).find(k => k.toLowerCase() === col.toLowerCase());
            if (matchedKey && formDataObj[matchedKey] !== undefined && formDataObj[matchedKey] !== null) {
                insertCols.push(`"${col}"`);
                insertVals.push(typeof formDataObj[matchedKey] === 'object' ? JSON.stringify(formDataObj[matchedKey]) : formDataObj[matchedKey]);
                placeholders.push(`$${insertVals.length}`);
            }
        }

        // Adicionar sempre dados_completos em JSONB (garantia de 100% dos dados)
        if (validColumns.includes('dados_completos')) {
            insertCols.push('"dados_completos"');
            insertVals.push(JSON.stringify(formDataObj));
            placeholders.push(`$${insertVals.length}`);
        }

        const query = `
            INSERT INTO ${tableName} (${insertCols.join(', ')}) 
            VALUES (${placeholders.join(', ')}) 
            RETURNING id
        `;
        
        await client.query(query, insertVals);

        // 4. Chamar Webhook do Make.com (Se configurado)
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
