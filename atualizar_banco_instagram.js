const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb';

async function updateDatabase() {
    const client = new Client({ 
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        await client.connect();
        console.log("Conectado ao banco de dados Neon.");

        const table = 'orcamentos_gerenciamento_instagram';
        
        const newColumns = [
            'nome',
            'instagram',
            'como_conheceu',
            'whatsapp',
            'nicho',
            'quantidade_posts',
            'tipo_venda',
            'investimento',
            'investimento_outro',
            'entrega_ideal',
            'ciente_conteudo',
            'ciente_vaga'
        ];

        let addedCount = 0;

        for (const col of newColumns) {
            try {
                // Adiciona a coluna se ela não existir
                const query = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${col}" TEXT;`;
                await client.query(query);
                console.log(`Coluna verificada/criada: ${col}`);
                addedCount++;
            } catch (err) {
                console.error(`Erro ao adicionar coluna ${col}:`, err.message);
            }
        }

        console.log(`\nOperação concluída. ${addedCount} colunas processadas na tabela '${table}'.`);
        
    } catch (error) {
        console.error("Erro ao conectar ou atualizar o banco:", error);
    } finally {
        await client.end();
    }
}

updateDatabase();
