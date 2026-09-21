/**
 * LIZ DESIGN - RAIO-X DO INSTAGRAM JS
 * Motor de lógica, cálculo e renderização do Atelier Virtual (Resultados)
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================================================
    // 1. MÁSCARA PARA WHATSAPP
    // ==========================================================================
    const whatsappInputs = document.querySelectorAll('input[type="tel"]');
    whatsappInputs.forEach(input => {
        input.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            }
            e.target.value = value.substring(0, 15);
        });
    });

    // ==========================================================================
    // 2. LÓGICA MULTI-STEP DO QUIZ
    // ==========================================================================
    const form = document.getElementById('raiox-form');
    if (!form) return;

    const steps = form.querySelectorAll('.form-step');
    let currentStep = 0;
    const progressBar = document.getElementById('progress-bar');

    function updateProgress() {
        if (progressBar) {
            const percent = ((currentStep) / (steps.length - 1)) * 100;
            progressBar.style.width = percent + '%';
        }
    }

    function showStep(index) {
        steps.forEach((step, i) => {
            step.style.display = (i === index) ? 'block' : 'none';
        });
        currentStep = index;
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateStep(index) {
        const currentStepEl = steps[index];
        const requiredInputs = currentStepEl.querySelectorAll('input[required]');
        let isValid = true;
        for (let input of requiredInputs) {
            if (!input.checkValidity()) {
                input.reportValidity(); 
                isValid = false;
                break; 
            }
        }
        return isValid;
    }

    const nextBtns = form.querySelectorAll('.btn-next');
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                if (currentStep >= steps.length) currentStep = steps.length - 1;
                showStep(currentStep);
            }
        });
    });

    const prevBtns = form.querySelectorAll('.btn-prev');
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            if (currentStep < 0) currentStep = 0;
            showStep(currentStep);
        });
    });

    // Auto-advance em radio buttons para deixar o quiz dinâmico e rápido
    const radioInputs = form.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            // Pequeno delay para o usuário ver a seleção
            setTimeout(() => {
                if (validateStep(currentStep)) {
                    currentStep++;
                    showStep(currentStep);
                }
            }, 300);
        });
    });

    showStep(currentStep);


    // ==========================================================================
    // 3. MOTOR DE CÁLCULO E BENCHMARK
    // ==========================================================================
    const BENCHMARK_SCORE = 62;
    const SCORE_MAP = { 'A': 8.33, 'B': 4, 'C': 0 };

    function getRadioScore(name) {
        const el = document.querySelector(`input[name="${name}"]:checked`);
        return el ? SCORE_MAP[el.value] : 0;
    }

    function calculateScores() {
        const clareza = Math.round(getRadioScore('Q1') + getRadioScore('Q2') + getRadioScore('Q3'));
        const autoridade = Math.round(getRadioScore('Q4') + getRadioScore('Q5') + getRadioScore('Q6'));
        const percepcao = Math.round(getRadioScore('Q7') + getRadioScore('Q8') + getRadioScore('Q9'));
        const conversao = Math.round(getRadioScore('Q10') + getRadioScore('Q11') + getRadioScore('Q12'));

        const geral = clareza + autoridade + percepcao + conversao;

        const dimensions = [
            { name: 'Clareza', score: clareza },
            { name: 'Autoridade', score: autoridade },
            { name: 'Percepção', score: percepcao },
            { name: 'Conversão', score: conversao }
        ];

        // Gargalo é a dimensão com o menor score
        dimensions.sort((a, b) => a.score - b.score);
        const gargalo = dimensions[0];

        // Atualiza campos ocultos para o banco
        document.getElementById('score_clareza').value = clareza;
        document.getElementById('score_autoridade').value = autoridade;
        document.getElementById('score_percepcao').value = percepcao;
        document.getElementById('score_conversao').value = conversao;
        document.getElementById('score_geral').value = geral;
        document.getElementById('dimensao_gargalo').value = gargalo.name;

        return { clareza, autoridade, percepcao, conversao, geral, gargalo };
    }

    // ==========================================================================
    // 4. RENDERIZAÇÃO DO ATELIER (RESULTADOS)
    // ==========================================================================
    function renderAtelier(results) {
        const quizContainer = document.getElementById('quiz-container');
        const atelierView = document.getElementById('atelier-view');
        const processingView = document.getElementById('processing-view');
        const resultsView = document.getElementById('results-view');

        // Esconde o form e mostra o atelier em modo processing
        quizContainer.style.display = 'none';
        atelierView.style.display = 'block';

        // Animação de barra
        document.getElementById('final-score').textContent = results.geral;
        
        // Simular cálculo para tensão produtiva (3 segundos)
        setTimeout(() => {
            processingView.style.display = 'none';
            resultsView.style.display = 'block';

            // Animação do progress bar
            setTimeout(() => {
                document.getElementById('score-bar').style.width = results.geral + '%';
            }, 100);

            // Popula as notas
            document.getElementById('dim-clareza').textContent = results.clareza;
            document.getElementById('dim-autoridade').textContent = results.autoridade;
            document.getElementById('dim-percepcao').textContent = results.percepcao;
            document.getElementById('dim-conversao').textContent = results.conversao;

            // Texto do Benchmark
            const bText = document.getElementById('benchmark-text');
            if (results.geral >= BENCHMARK_SCORE) {
                bText.innerHTML = `Média da nossa base: <strong>${BENCHMARK_SCORE}</strong>.<br>Parabéns! Você está <span style="color: green; font-weight: bold;">${results.geral - BENCHMARK_SCORE} pontos acima</span> da média do mercado. Mas seu perfil ainda tem um gargalo oculto.`;
            } else {
                bText.innerHTML = `Média da nossa base: <strong>${BENCHMARK_SCORE}</strong>.<br>Você está <span style="color: red; font-weight: bold;">${BENCHMARK_SCORE - results.geral} pontos abaixo</span> da média. Isso significa que você está deixando dinheiro na mesa.`;
            }

            // Gargalo e Evidência
            document.getElementById('gargalo-nome').textContent = results.gargalo.name;
            document.getElementById('cta-gargalo').textContent = results.gargalo.name;
            
            const desc = document.getElementById('gargalo-desc');
            const evidencia = document.getElementById('evidencia-cientifica');
            const cta = document.getElementById('cta-link');

            if (results.gargalo.name === 'Percepção') {
                desc.textContent = "Seu negócio pode estar entregando muito valor, mas a sua apresentação visual está abaixo do nível de percepção observado na nossa base. As pessoas julgam a qualidade do seu serviço pela qualidade do seu design.";
                evidencia.innerHTML = `<strong>Por que percepção importa?</strong><br>O <em>Stanford Web Credibility Project</em> estudou milhares de avaliações online e provou que escolhas de design visual e organização são os principais fatores que influenciam a percepção imediata de credibilidade profissional.`;
                cta.textContent = "Quero o Mapa da Identidade Visual";
            } 
            else if (results.gargalo.name === 'Conversão') {
                desc.textContent = "Seu problema não parece ser estética, mas sim a jornada de vendas. Seu Instagram não conduz as pessoas para uma ação clara. Você está colecionando visualizações, mas perdendo clientes por falta de um funil de comunicação.";
                evidencia.innerHTML = `<strong>A ciência da conversão:</strong><br>Estudos comportamentais mostram que o atrito (dificuldade de entender o próximo passo) reduz a ação de compra em até 40%. Seu cliente ideal precisa ser conduzido, e não apenas atraído.`;
                cta.textContent = "Quero o Mapa de Gestão do Instagram";
            }
            else if (results.gargalo.name === 'Clareza') {
                desc.textContent = "Você está confundindo sua audiência. Quando alguém chega no seu perfil, gasta energia tentando descobrir o que você vende. A confusão gera abandono imediato.";
                evidencia.innerHTML = `<strong>Processing Fluency:</strong><br>A literatura experimental sobre <em>processing fluency</em> mostra que a facilidade com que uma informação é entendida influencia diretamente julgamentos de valor, beleza e confiabilidade. Mensagens confusas parecem menos valiosas.`;
                cta.textContent = "Quero uma Consultoria de Posicionamento";
            }
            else if (results.gargalo.name === 'Autoridade') {
                desc.textContent = "As pessoas até entendem o que você faz, mas não confiam o suficiente para comprar. Você precisa estruturar sua prova social, mostrar método e parar de competir por preço.";
                evidencia.innerHTML = `<strong>O viés da autoridade:</strong><br>Pessoas tendem a obedecer e confiar em figuras que demonstram credenciais. Sem estruturar suas vitórias e depoimentos, você obriga o cliente a confiar apenas na sua própria palavra, o que aumenta a resistência à venda.`;
                cta.textContent = "Quero a Consultoria de Posicionamento";
            }

        }, 3000); // 3 segundos de "tensão"
    }

    // ==========================================================================
    // 5. ENVIO SILENCIOSO (AJAX)
    // ==========================================================================
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        
        if(!validateStep(currentStep)) return;

        const results = calculateScores();

        // Alterar botão
        const submitBtn = document.getElementById('btn-gerar');
        submitBtn.style.opacity = '0.7';
        submitBtn.style.pointerEvents = 'none';
        submitBtn.textContent = "Processando Dados...";

        // Enviar silenciosamente
        const data = new FormData(form);
        const formDataObj = Object.fromEntries(data.entries());

        try {
            // Fire and forget (não travamos o usuário se falhar a internet dele)
            fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formDataObj)
            });

            // Transição visual
            renderAtelier(results);

        } catch (error) {
            console.error("Erro interno:", error);
            renderAtelier(results); // Mostra o resultado de qualquer forma
        }
    });

});
