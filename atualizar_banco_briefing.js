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
        const table = 'briefings_identidade_visual';
        const newColumns = ['nome_marca', 'motivo_escolha'];

        for (const col of newColumns) {
            try {
                await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${col}" TEXT;`);
                console.log(`Coluna verificada/criada: ${col}`);
            } catch (err) {
                console.error(`Erro ao adicionar coluna ${col}:`, err.message);
            }
        }
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        await client.end();
    }
}

updateDatabase();
