const { Client } = require('pg');

// Coloque sua string de conexão Neon aqui ou no arquivo .env como POSTGRES_URL
const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_K0DUPzW4splG@ep-divine-cherry-acjd0tmq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function updateDatabase() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log("Conectado ao banco de dados Neon.");

        const table = 'briefings_identidade_visual';
        
        // Mapeamento dos novos campos do Brand Discovery
        // O tipo padrão será TEXT para suportar tanto strings curtas quanto longas/arrays.
        const newColumns = [
            'status_marca',
            'motivo_nascimento',
            'motivo_escolha_negocio',
            'historia_importante',
            'tem_significado_nome',
            'significado_nome',
            'conceito_inseparavel',
            'frase_resumo',
            'o_que_vende',
            'tipo_produto',
            'tipo_produto_outro',
            'motivo_compra',
            'diferenca_outros',
            'algo_diferente',
            'pitch_10s',
            'perfil_cliente',
            'problema_cliente',
            'influencia_compra',
            'influencia_compra_outro',
            'sentimento_desejado',
            'sentimento_desejado_outro',
            'cliente_indesejado',
            'concorrentes',
            'concorrentes_bom',
            'fazer_diferente',
            'evitar_mercado',
            'diferenca_percebida',
            'atributos_gerais',
            'atributos_gerais_outro',
            'atributos_top3',
            'atributos_nao_transmitir',
            'atributos_nao_transmitir_outro',
            'porque_atributos',
            'eixo_tradicional_contemporanea',
            'eixo_seria_descontraida',
            'eixo_acessivel_exclusiva',
            'eixo_discreta_ousada',
            'eixo_racional_emocional',
            'eixo_minimalista_expressiva',
            'percepcao_primeiravez',
            'percepcao_poscompra',
            'percepcao_indesejada',
            'falta_marca',
            'marcas_admiradas',
            'gosto_referencias',
            'gosto_referencias_outro',
            'marcas_nao_admiradas',
            'nao_gosto_referencias',
            'ambiente_proximo',
            'ambiente_proximo_outro',
            'atmosfera_combinada',
            'universo_evitar',
            'cor_desejada_opcao',
            'cor_desejada_qual',
            'cor_indesejada',
            'simbolo_desejado',
            'simbolo_indesejado',
            'identidade_preservar',
            'identidade_abandonar',
            'aplicacoes',
            'aplicacoes_outro',
            'aplicacao_principal',
            'aplicacao_especial',
            'empresa_hoje',
            'empresa_5_anos',
            'representacao_futuro',
            'expansao',
            'como_expandir',
            'unica_coisa_resolver',
            'validacao_espelho',
            'ajustes_espelho',
            'consideracoes_finais'
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
