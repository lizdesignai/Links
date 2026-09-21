const { Client } = require('pg');

const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function createRaioXTable() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log("Conectado ao banco de dados Neon para criar tabela Raio-X do Instagram.");

        const query = `
            CREATE TABLE IF NOT EXISTS raiox_instagram (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                nome_cliente TEXT,
                email TEXT,
                whatsapp TEXT,
                score_clareza NUMERIC,
                score_autoridade NUMERIC,
                score_percepcao NUMERIC,
                score_conversao NUMERIC,
                score_geral NUMERIC,
                dimensao_gargalo TEXT,
                dados_completos JSONB
            );
        `;

        await client.query(query);
        console.log("Tabela raiox_instagram verificada/criada.");
        console.log("Operação concluída com sucesso.");
    } catch (error) {
        console.error("Erro ao conectar ou atualizar o banco:", error);
    } finally {
        await client.end();
    }
}

createRaioXTable();
