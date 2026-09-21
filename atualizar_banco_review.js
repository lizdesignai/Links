const { Client } = require('pg');

const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function createReviewTable() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log("Conectado ao banco de dados Neon para criar tabela Brand Experience Review.");

        const query = `
            CREATE TABLE IF NOT EXISTS brand_experience_review (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                nome_cliente TEXT,
                email TEXT,
                whatsapp TEXT,
                satisfacao_experiencia TEXT,
                correspondeu_esperado TEXT,
                entendeu_marca TEXT,
                processo_resultado TEXT,
                o_que_mais_gostou TEXT,
                momento_marcou TEXT,
                momento_entendeu TEXT,
                satisfacao_identidade TEXT,
                representa_melhor TEXT,
                transmite_caracteristicas TEXT,
                nao_transmite TEXT,
                nps TEXT,
                nps_motivo TEXT,
                explicacao_trabalho TEXT,
                autoriza_depoimento TEXT,
                autoriza_contato_confirmar TEXT,
                percebeu_mudanca TEXT,
                mudanca_qual TEXT,
                recebeu_comentario TEXT,
                o_que_disseram TEXT,
                print_base64 TEXT,
                proximo_desafio TEXT,
                resolver_outro_problema TEXT,
                servicos_interesse TEXT,
                melhorar_12_meses TEXT,
                novo_contato TEXT,
                assunto_contato TEXT,
                dados_completos JSONB
            );
        `;

        await client.query(query);
        console.log("Tabela brand_experience_review verificada/criada.");
        console.log("Operação concluída com sucesso.");
    } catch (error) {
        console.error("Erro ao conectar ou atualizar o banco:", error);
    } finally {
        await client.end();
    }
}

createReviewTable();
