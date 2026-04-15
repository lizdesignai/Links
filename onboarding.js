// ============================================================================
// ATELIER OS - MOTOR DE ONBOARDING ESTRATÉGICO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. ESTADO GLOBAL E REFERÊNCIAS DOM
    // ==========================================
    let currentStep = 0;
    const totalSteps = 6; // Steps de 0 a 6 (7 telas no total) + Tela de Sucesso
    
    const mainScroll = document.getElementById('main-scroll');
    const footer = document.getElementById('form-footer');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const progressTracker = document.getElementById('progress-tracker');
    const toast = document.getElementById('toast');

    // Dados Iniciais (Payload)
    let payload = {
        tilt_technical: 25, 
        tilt_culture: 25, 
        tilt_status: 25, 
        tilt_community: 25,
        semiotics_choices: {}, 
        voice_scenarios: {}
    };

    // Controle de Índices
    let semioticsIndex = 0;

    // ==========================================
    // 2. DICIONÁRIOS DE DADOS ESTRATÉGICOS
    // ==========================================
    const SEMIOTICS_PAIRS = [
        { id: "lighting", title: "Luz e Atmosfera", optA: { img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop", desc: "Sol da manhã invadindo organicamente, sombras suaves. (Acolhimento)" }, optB: { img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop", desc: "Luz dura, sombras recortadas e dramáticas. (Poder/Mistério)" } },
        { id: "framing", title: "Foco e Narrativa", optA: { img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop", desc: "Foco macro extremo, texturas detalhadas. (Preciosismo)" }, optB: { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop", desc: "Plano aberto, visão do ambiente em pleno funcionamento. (Expansão)" } },
        { id: "presence", title: "Presença Humana", optA: { img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop", desc: "Pessoas em movimento, leve desfoque, ação do trabalho. (Dinâmica)" }, optB: { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop", desc: "Retrato posado, estático, contato visual firme. (Imponência)" } },
        { id: "temperature", title: "Temperatura de Cor", optA: { img: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=800&auto=format&fit=crop", desc: "Tons quentes, madeira crua, luz amarelada. (Tradição/Proximidade)" }, optB: { img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop", desc: "Tons frios, cinzas, luz branca cirúrgica. (Hiper-modernidade)" } },
        { id: "composition", title: "Composição", optA: { img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop", desc: "Elementos casuais e assimétricos na mesa. (Caos Criativo)" }, optB: { img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop", desc: "Simetria absoluta, grid perfeito, alinhamento. (Rigor Técnico)" } },
        { id: "setting", title: "Cenário", optA: { img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop", desc: "Texturas urbanas, asfalto, a fricção da rua. (Vivência)" }, optB: { img: "https://images.unsplash.com/photo-1600607687920-4e2a09be15c7?q=80&w=800&auto=format&fit=crop", desc: "Arquitetura polida, vidros limpos, mármore. (Isolamento/Luxo)" } },
        { id: "post_prod", title: "Acabamento", optA: { img: "https://images.unsplash.com/photo-1493804714600-6edb1cd93080?q=80&w=800&auto=format&fit=crop", desc: "Granulação visível (35mm), imperfeições. (Nostalgia/Verdade)" }, optB: { img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop", desc: "Nitidez digital 4K, alto contraste limpo. (Sofisticação)" } },
        { id: "negative_space", title: "Espaço Negativo", optA: { img: "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=800&auto=format&fit=crop", desc: "Informação densa preenchendo o frame. (Complexidade)" }, optB: { img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop", desc: "Elemento central, 80% de espaço vazio. (Minimalismo Absoluto)" } }
    ];
    
    const SCENARIOS = [
        { 
            id: "price", title: "O Confronto de Valor", 
            context: "Um prospect comenta publicamente: 'O vosso preço está muito acima do mercado e o concorrente faz mais barato.'", 
            options: [ 
                { id: "A", label: "Acolhedora / Educativa", text: "Compreendemos. O nosso foco é entregar durabilidade que o padrão atual não suporta. Se quiser entender o processo, estamos à disposição." }, 
                { id: "B", label: "Distante / Soberana", text: "Nossa estrutura não foi desenhada para competir em custo, mas em resultado absoluto. O mercado possui opções para diferentes momentos." }, 
                { id: "C", label: "Implacável / Agressiva", text: "O barato cobra a conta em retrabalho e frustração. Nós preferimos cobrar apenas uma vez e resolver o problema em definitivo." } 
            ] 
        },
        { 
            id: "failure", title: "O Bastidor do Fracasso", 
            context: "A equipa cometeu um erro que atrasou uma entrega, mas já foi 100% resolvido. O que vai para as redes?", 
            options: [ 
                { id: "A", label: "Transparência Radical", text: "Mostramos o erro nos Stories, o caos gerado e como virámos a noite para consertar. O suor constrói confiança." }, 
                { id: "B", label: "Proteção do Legado", text: "Resolvemos no privado. O feed mantém foco exclusivo na excelência. A marca não sangra em praça pública." }, 
                { id: "C", label: "Evolução Técnica", text: "Não falamos do erro. Postamos sobre o novo protocolo de segurança que implementámos. Foco na evolução estrutural." } 
            ] 
        },
        { 
            id: "victory", title: "A Celebração da Vitória", 
            context: "Acabaram de quebrar o recorde histórico de faturação. O que o público lê no próximo post?", 
            options: [ 
                { id: "A", label: "A Tribo", text: "Agradecimento caloroso à equipa e clientes. Fotos da comemoração interna: 'nós vencemos juntos'." }, 
                { id: "B", label: "Minimalismo Estratégico", text: "Estética limpa, texto conciso sobre consistência. Sem grandes festas. Mensagem: 'Isto é só mais uma terça-feira'." }, 
                { id: "C", label: "O Próximo Alvo", text: "A vitória quase não é mencionada. O foco já é no próximo passo. Mensagem: 'O semestre foi bom, mas vamos redefinir o mercado'." } 
            ] 
        }
    ];

    // ==========================================
    // 3. UTILITÁRIOS DA INTERFACE E VALIDAÇÃO
    // ==========================================
    let toastTimeout;
    window.showToast = function(msg) {
        if(toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = msg;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
    };

    // Lógica do Select "Outro" no Step 1
    const gatilhoSelect = document.getElementById('gatilho_select');
    const gatilhoOutroContainer = document.getElementById('gatilho_outro_container');
    const gatilhoOutroInput = document.querySelector('input[name="gatilho_compra_outro"]');
    
    if(gatilhoSelect) {
        gatilhoSelect.addEventListener('change', function(e) {
            if (e.target.value === 'Outro') {
                gatilhoOutroContainer.classList.remove('hidden');
                gatilhoOutroInput.setAttribute('required', 'true');
            } else {
                gatilhoOutroContainer.classList.add('hidden');
                gatilhoOutroInput.removeAttribute('required');
                gatilhoOutroInput.value = ''; 
            }
        });
    }

    // Gestão de Radio Buttons Genéricos (Steps 3)
    window.selectRadio = function(element, inputName, value) {
        const group = element.parentElement;
        group.querySelectorAll('.radio-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        document.getElementById(inputName + '_input').value = value;
    };

    function updateProgressUI() {
        const dots = progressTracker.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            if (idx <= currentStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        
        if (currentStep === totalSteps) {
            btnNext.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Finalizar e Enviar`;
            btnNext.classList.remove('btn-next');
            btnNext.classList.add('btn-finish');
        } else {
            btnNext.innerHTML = `Avançar <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
            btnNext.classList.remove('btn-finish');
            btnNext.classList.add('btn-next');
        }
    }

    // VALIDAÇÃO BLINDADA ANTES DE AVANÇAR
    function validateCurrentStep() {
        const currentContainer = document.querySelector(`.step-container[data-step="${currentStep}"]`);
        if (!currentContainer) return true;

        // 1. Inputs Nativos (text, email, tel, textarea, select)
        const requiredFields = currentContainer.querySelectorAll('input[required]:not([type="hidden"]), textarea[required], select[required]');
        for (let field of requiredFields) {
            if (!field.value || field.value.trim() === '') {
                window.showToast('Por favor, preencha todos os campos obrigatórios (*).');
                field.focus();
                return false;
            }
        }

        // 2. Radio Buttons Ocultos (Step 3)
        if (currentStep === 3) {
            const radioInputs = currentContainer.querySelectorAll('input[type="hidden"][required]');
            for (let field of radioInputs) {
                if (!field.value || field.value.trim() === '') {
                    window.showToast('Por favor, selecione uma opção em todas as perguntas.');
                    return false;
                }
            }
        }

        // 3. Eixo de Atenção (Step 4)
        if (currentStep === 4) {
            const sum = payload.tilt_technical + payload.tilt_culture + payload.tilt_status + payload.tilt_community;
            if (sum !== 100) {
                window.showToast(`As Fichas de Foco devem somar 100%. Total atual: ${sum}%.`);
                return false;
            }
        }

        // 4. Semiótica (Step 5)
        if (currentStep === 5) {
            const choicesMade = Object.keys(payload.semiotics_choices).length;
            if (choicesMade < SEMIOTICS_PAIRS.length) {
                window.showToast(`Conclua as rondas de Semiótica (${choicesMade}/${SEMIOTICS_PAIRS.length}). Avance nas imagens.`);
                return false;
            }
        }

        // 5. Prova de Fogo (Step 6)
        if (currentStep === 6) {
            const scenariosAnswered = Object.keys(payload.voice_scenarios).length;
            if (scenariosAnswered < SCENARIOS.length) {
                window.showToast(`Responda a todos os cenários da Prova de Fogo (${scenariosAnswered}/${SCENARIOS.length}).`);
                return false;
            }
        }

        return true;
    }

    // ==========================================
    // 4. NAVEGAÇÃO DE PASSOS
    // ==========================================
    function transitionStep(direction) {
        const oldContainer = document.querySelector(`.step-container[data-step="${currentStep}"]`);
        
        // Efeito de saída suave
        oldContainer.style.opacity = '0';
        oldContainer.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            oldContainer.classList.remove('active');
            // Restaura estilos para a próxima vez
            oldContainer.style.opacity = '';
            oldContainer.style.transform = '';
            
            if(direction === 'next') currentStep++;
            else currentStep--;
            
            document.querySelector(`.step-container[data-step="${currentStep}"]`).classList.add('active');
            updateProgressUI();
            mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300); // 300ms de transição de CSS
    }

    window.nextStep = function() {
        if (!validateCurrentStep()) return;

        if (currentStep === totalSteps) {
            window.submitFinalPayload();
            return;
        }

        transitionStep('next');
    };

    window.prevStep = function() {
        if (currentStep === 0) return;
        transitionStep('prev');
    };

    // ==========================================
    // 5. ALGORITMO: EIXO DE ATENÇÃO (Step 4)
    // ==========================================
    const tiltLabels = { technical: 'tech', culture: 'cult', status: 'stat', community: 'comm' };
    
    window.handleTilt = function(changedKey, newValueStr) {
        let newValue = parseInt(newValueStr, 10);
        let oldVal = payload[`tilt_${changedKey}`];
        let delta = newValue - oldVal;
        
        if (delta === 0) return;

        const keys = ['technical', 'culture', 'status', 'community'];
        let otherKeys = keys.filter(k => k !== changedKey);
        let otherSum = otherKeys.reduce((sum, k) => sum + payload[`tilt_${k}`], 0);

        let tempPayload = { ...payload };
        tempPayload[`tilt_${changedKey}`] = newValue;

        if (otherSum === 0) {
            let split = -delta / otherKeys.length;
            otherKeys.forEach(k => tempPayload[`tilt_${k}`] = Math.max(0, tempPayload[`tilt_${k}`] + split));
        } else {
            otherKeys.forEach(k => {
                let proportion = tempPayload[`tilt_${k}`] / otherSum;
                tempPayload[`tilt_${k}`] = Math.max(0, Math.round(tempPayload[`tilt_${k}`] - (delta * proportion)));
            });
        }

        let currentSum = keys.reduce((a, k) => a + tempPayload[`tilt_${k}`], 0);
        if (currentSum !== 100) {
            let diff = 100 - currentSum;
            let largestKey = otherKeys.reduce((a, b) => tempPayload[`tilt_${a}`] > tempPayload[`tilt_${b}`] ? a : b);
            tempPayload[`tilt_${largestKey}`] += diff;
        }

        let isValid = true;
        keys.forEach(k => { if(tempPayload[`tilt_${k}`] < 0) isValid = false; });

        if(isValid) {
            keys.forEach(k => payload[`tilt_${k}`] = tempPayload[`tilt_${k}`]);
            
            keys.forEach(k => {
                document.getElementById(`tilt-${tiltLabels[k]}`).value = payload[`tilt_${k}`];
                document.getElementById(`val-${tiltLabels[k]}`).innerText = payload[`tilt_${k}`] + '%';
            });
            
            const realSum = keys.reduce((a, k) => a + payload[`tilt_${k}`], 0);
            const sumDisplay = document.getElementById('total-fichas');
            sumDisplay.innerHTML = `${realSum}<span style="font-size:16px; color:rgba(92,75,60,0.3);">/100</span>`;
            if(realSum === 100) {
                sumDisplay.style.color = '#16a34a'; 
            } else {
                sumDisplay.style.color = '#ef4444'; 
            }
        }
    };

    // ==========================================
    // 6. MOTOR: SEMIÓTICA VISUAL (Step 5)
    // ==========================================
    function renderSemiotics() {
        const pair = SEMIOTICS_PAIRS[semioticsIndex];
        const grid = document.querySelector('.semiotics-grid');
        grid.style.opacity = '0.5';

        setTimeout(() => {
            document.getElementById('semiotic-title').innerText = `Rodada ${semioticsIndex + 1}/8: ${pair.title}`;
            document.getElementById('img-A').src = pair.optA.img;
            document.getElementById('desc-A').innerText = pair.optA.desc;
            document.getElementById('img-B').src = pair.optB.img;
            document.getElementById('desc-B').innerText = pair.optB.desc;

            document.getElementById('card-A').classList.remove('selected');
            document.getElementById('card-B').classList.remove('selected');

            const tracker = document.getElementById('semiotic-tracker');
            tracker.innerHTML = '';
            for(let i=0; i<SEMIOTICS_PAIRS.length; i++) {
                let dot = document.createElement('div');
                dot.className = `dot ${i === semioticsIndex ? 'active' : ''}`;
                if (payload.semiotics_choices[SEMIOTICS_PAIRS[i].id]) {
                    dot.style.background = 'var(--terracota)';
                }
                tracker.appendChild(dot);
            }
            grid.style.opacity = '1';
        }, 150);
    }

    window.chooseSemiotics = function(choice) {
        const pairId = SEMIOTICS_PAIRS[semioticsIndex].id;
        payload.semiotics_choices[pairId] = choice;
        document.getElementById(`card-${choice}`).classList.add('selected');

        setTimeout(() => {
            if (semioticsIndex < SEMIOTICS_PAIRS.length - 1) {
                semioticsIndex++;
                renderSemiotics();
            } else {
                window.showToast("Teste Semiótico concluído com sucesso. Pode avançar.");
                const tracker = document.getElementById('semiotic-tracker');
                tracker.children[semioticsIndex].style.background = 'var(--terracota)';
            }
        }, 400); 
    };

    // ==========================================
    // 7. MOTOR: CENÁRIOS DE VOZ (Step 6)
    // ==========================================
    function renderVoiceScenarios() {
        const container = document.getElementById('step-voice');
        container.innerHTML = ''; 

        SCENARIOS.forEach((scen, idx) => {
            let html = `
            <div class="form-group" style="margin-bottom: 24px;">
                <span class="input-label" style="text-align:center; display:inline-block; width:100%; margin-bottom:8px; background:rgba(255,255,255,0.8); padding:6px 12px; border-radius:20px; border:1px solid rgba(92,75,60,0.1);">Cenário ${idx + 1}: ${scen.title}</span>
                <p class="step-desc" style="font-family: var(--font-elegant); font-size: 20px; font-style: italic; color: var(--grafite); text-align: center; margin-bottom: 24px;">"${scen.context}"</p>
                <div class="radio-group">
            `;
            
            scen.options.forEach(opt => {
                html += `
                    <div class="radio-option voice-opt-${scen.id}" onclick="selectVoiceScenario('${scen.id}', '${opt.id}', this)">
                        <div class="radio-circle"></div>
                        <div>
                            <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--terracota); display:block; margin-bottom:4px;">${opt.label}</span>
                            <span class="radio-text">${opt.text}</span>
                        </div>
                    </div>`;
            });
            html += `</div></div>`;
            container.innerHTML += html;
        });
    }

    window.selectVoiceScenario = function(scenId, choiceId, element) {
        payload.voice_scenarios[scenId] = choiceId;
        document.querySelectorAll(`.voice-opt-${scenId}`).forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    };

    // ==========================================
    // 8. COMPILADOR E SUBMISSÃO À API
    // ==========================================
    function gatherAllData() {
        const finalData = { ...payload };
        
        const inputs = document.querySelectorAll('#onboarding-form input:not([type="radio"]):not([type="range"]):not([type="hidden"]), #onboarding-form textarea, #onboarding-form select');
        inputs.forEach(input => {
            if (input.name) finalData[input.name] = input.value;
        });

        // Adiciona os escondidos do Step 3
        const hiddenInputs = document.querySelectorAll('#onboarding-form input[type="hidden"]');
        hiddenInputs.forEach(input => {
            if (input.name) finalData[input.name] = input.value;
        });

        return finalData;
    }

    window.submitFinalPayload = async function() {
        btnNext.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg> Enviando Cofre...`;
        btnNext.disabled = true;
        btnPrev.disabled = true;

        const dataToSubmit = gatherAllData();

        try {
            console.log("🚀 A iniciar transmissão segura do Dossiê para a API...", dataToSubmit);
            
            // 🔗 CHAMADA REAL À SUA API
            const response = await fetch('/api/public-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || "Falha na comunicação com o servidor Atelier OS.");
            }

            // TRANSIÇÃO PARA TELA DE SUCESSO
            document.querySelector(`.step-container[data-step="${currentStep}"]`).classList.remove('active');
            footer.style.display = 'none';
            progressTracker.style.display = 'none';
            document.querySelector('header p.subtitle').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Transmissão Concluída';
            
            document.getElementById('step-success').classList.add('active');

        } catch (error) {
            console.error("❌ Erro Crítico no Envio:", error);
            window.showToast(error.message || "Erro de ligação. Verifique a internet e tente novamente.");
            
            // Restaura os botões para permitir nova tentativa
            btnNext.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.6 5.6"></path></svg> Tentar Novamente`;
            btnNext.disabled = false;
            btnPrev.disabled = false;
        }
    };

    // ==========================================
    // INICIALIZAÇÃO DA APLICAÇÃO
    // ==========================================
    renderSemiotics();
    renderVoiceScenarios();
    updateProgressUI();

});