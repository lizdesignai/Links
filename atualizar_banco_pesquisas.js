const { Client } = require('pg');

const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function createSurveyTables() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log("Conectado ao banco de dados Neon para criar tabelas de pesquisa.");

        const queryIDV = `
            CREATE TABLE IF NOT EXISTS pesquisa_satisfacao_idv (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                nome_cliente TEXT,
                email TEXT,
                whatsapp TEXT,
                satisfacao_resultado TEXT,
                representa_melhor TEXT,
                chance_indicar TEXT,
                percepcao_marca TEXT,
                relato TEXT,
                autoriza_depoimento TEXT,
                dados_completos JSONB
            );
        `;

        const queryInstagram = `
            CREATE TABLE IF NOT EXISTS pesquisa_satisfacao_instagram (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                nome_cliente TEXT,
                email TEXT,
                whatsapp TEXT,
                satisfacao_gerenciamento TEXT,
                instagram_melhorou TEXT,
                chance_indicar TEXT,
                o_que_melhorou TEXT,
                relato TEXT,
                autoriza_depoimento TEXT,
                dados_completos JSONB
            );
        `;

        await client.query(queryIDV);
        console.log("Tabela pesquisa_satisfacao_idv verificada/criada.");

        await client.query(queryInstagram);
        console.log("Tabela pesquisa_satisfacao_instagram verificada/criada.");
        
        console.log("Operação concluída com sucesso.");
    } catch (error) {
        console.error("Erro ao conectar ou atualizar o banco:", error);
    } finally {
        await client.end();
    }
}

createSurveyTables();
