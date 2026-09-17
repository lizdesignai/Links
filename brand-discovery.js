/**
 * LIZ DESIGN - BRAND DISCOVERY JS
 * Motor de lógica para o formulário avançado de descoberta de marca.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================================================
    // 1. AUTO-RESIZE PARA TEXTAREAS & MÁSCARAS (UX Premium)
    // ==========================================================================
    const textareas = document.querySelectorAll('textarea');
    function autoResize() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    }
    textareas.forEach(textarea => {
        textarea.setAttribute('style', 'height:' + (textarea.scrollHeight) + 'px;overflow-y:hidden;');
        textarea.addEventListener('input', autoResize, false);
    });

    const whatsappInputs = document.querySelectorAll('input[type="tel"], input[id*="whatsapp" i], input[name*="whatsapp" i]');
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
    // 2. LÓGICA MULTI-STEP
    // ==========================================================================
    const form = document.getElementById('brand-discovery-form');
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

        // Se estivermos na etapa 15, gerar espelho
        if (steps[index].getAttribute('data-step') === "15") {
            generateBrandMirror();
        }
    }

    // Expose for external access if needed
    form.showStep = showStep;

    function validateStep(index) {
        const currentStepEl = steps[index];
        // Only validate visible required inputs inside the current step
        const requiredInputs = Array.from(currentStepEl.querySelectorAll('input[required], textarea[required], select[required]')).filter(el => {
            // Check if element or its container is not hidden by conditional logic
            let isHidden = false;
            let current = el;
            while(current && current !== currentStepEl) {
                if(current.style.display === 'none') {
                    isHidden = true;
                    break;
                }
                current = current.parentElement;
            }
            return !isHidden;
        });

        let isValid = true;

        for (let input of requiredInputs) {
            if (!input.checkValidity()) {
                input.reportValidity(); 
                isValid = false;
                break; 
            }
        }
        
        // Custom validations
        if(isValid) {
            // Validar limites de checkboxes na etapa atual
            const limitedGroups = currentStepEl.querySelectorAll('.limit-checkboxes');
            for(let group of limitedGroups) {
                const limit = parseInt(group.getAttribute('data-limit'));
                const checked = group.querySelectorAll('input[type="checkbox"]:checked').length;
                if(checked > limit) {
                    alert(`Por favor, selecione no máximo ${limit} opções.`);
                    isValid = false;
                    break;
                }
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

    showStep(currentStep);


    // ==========================================================================
    // 3. LÓGICA CONDICIONAL E INTERAÇÕES
    // ==========================================================================
    
    // Atualizar dependências em todos os inputs
    form.addEventListener('change', function(e) {
        const target = e.target;
        
        // Lógica de "depends-on" genérica
        const conditionals = document.querySelectorAll('.logic-conditional');
        conditionals.forEach(cond => {
            const dependsOnName = cond.getAttribute('data-depends-on');
            const dependsValues = cond.getAttribute('data-depends-value').split('|'); // suporta OR com |
            
            // Pega o valor atual do input referenciado
            const refInput = form.querySelector(`input[name="${dependsOnName}"]:checked`) || form.querySelector(`select[name="${dependsOnName}"]`);
            if (refInput && dependsValues.includes(refInput.value)) {
                cond.style.display = 'block';
                // tornar inputs obrigatórios novamente se tinham required (poderiamos usar uma classe required-if-visible)
            } else {
                cond.style.display = 'none';
            }
        });

        // Lógica específica: A marca já existe?
        if(target.name === 'Status_Marca') {
            const brandExistsSection = document.querySelectorAll('.logic-conditional-brand-exists');
            if(target.value === 'Ainda não' || target.value === 'Está começando agora') {
                brandExistsSection.forEach(el => el.style.display = 'none');
            } else {
                brandExistsSection.forEach(el => el.style.display = 'block');
            }
        }

        // Popular etapa de 3 atributos com base nas escolhas gerais
        if(target.name === 'Atributos_Gerais') {
            populateTop3Attributes();
        }
    });

    // Validar limites de checkboxes em tempo real
    const limitGroups = document.querySelectorAll('.limit-checkboxes');
    limitGroups.forEach(group => {
        const limit = parseInt(group.getAttribute('data-limit'));
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                const checked = group.querySelectorAll('input[type="checkbox"]:checked').length;
                if (checked > limit) {
                    this.checked = false;
                    alert(`Você só pode selecionar até ${limit} opções neste campo.`);
                }
            });
        });
    });

    // Jogo Visual: Seleção por cards (Atmosphere & Environments)
    const visualGroups = document.querySelectorAll('.visual-selection-group');
    visualGroups.forEach(group => {
        const items = group.querySelectorAll('.visual-choice-item');
        const hiddenInput = group.querySelector('input[type="hidden"]');
        
        items.forEach(item => {
            item.addEventListener('click', function() {
                // Remover selected de todos irmãos
                items.forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                hiddenInput.value = this.getAttribute('data-value');
                // Trigger change to validate
                const event = new Event('change');
                hiddenInput.dispatchEvent(event);
            });
        });
    });

    function populateTop3Attributes() {
        const selectedGerais = Array.from(document.querySelectorAll('input[name="Atributos_Gerais"]:checked')).map(cb => cb.value);
        const targetGrid = document.querySelector('.dynamic-options .target-grid');
        if(!targetGrid) return;
        
        targetGrid.innerHTML = ''; // Clear current
        
        if(selectedGerais.length === 0) {
            targetGrid.innerHTML = '<p style="font-size: 0.9rem; opacity: 0.7; grid-column: 1 / -1;">Nenhum atributo selecionado na pergunta anterior.</p>';
            return;
        }

        selectedGerais.forEach(val => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="Atributos_Top3" value="${val}"> ${val}`;
            targetGrid.appendChild(label);
        });

        // Re-attach limit listener to new checkboxes
        const group = targetGrid.closest('.limit-checkboxes');
        const limit = parseInt(group.getAttribute('data-limit'));
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                const checked = group.querySelectorAll('input[type="checkbox"]:checked').length;
                if (checked > limit) {
                    this.checked = false;
                    alert(`Você só pode selecionar até ${limit} opções neste campo.`);
                }
            });
        });
    }

    // ==========================================================================
    // 4. ESPELHO DA MARCA (SÍNTESE DINÂMICA)
    // ==========================================================================
    function getRadioValue(name) {
        const el = document.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : '';
    }
    function getCheckedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
    }
    function getSliderText(name, val1, val2) {
        const val = parseInt(document.querySelector(`input[name="${name}"]`).value);
        if(val === 1) return `Totalmente ${val1}`;
        if(val === 2) return `Mais ${val1}`;
        if(val === 3) return `Equilíbrio entre ${val1} e ${val2}`;
        if(val === 4) return `Mais ${val2}`;
        if(val === 5) return `Totalmente ${val2}`;
        return '';
    }

    function generateBrandMirror() {
        const mirrorContainer = document.getElementById('mirror-data');
        
        // Coleta dados
        const top3 = getCheckedValues('Atributos_Top3');
        const atributosFormatados = top3.length > 0 ? top3.join(' · ') : '(Atributos não selecionados)';
        
        const naoTransmitir = getCheckedValues('Atributos_Nao_Transmitir');
        const negativosFormatados = naoTransmitir.length > 0 ? naoTransmitir.join(', ') : '(Nada informado)';

        const buscaPublico = getCheckedValues('Influencia_Compra');
        const publicoFormatado = buscaPublico.length > 0 ? buscaPublico.join(' + ') : '(Não informado)';

        const diferencial = document.getElementById('fazer_diferente').value || document.getElementById('diferenca_percebida').value || '(Diferencial não informado)';

        const eixo1 = getSliderText('Eixo_Tradicional_Contemporanea', 'Tradicional', 'Contemporânea');
        const eixo2 = getSliderText('Eixo_Acessivel_Exclusiva', 'Acessível', 'Exclusiva');
        const eixo3 = getSliderText('Eixo_Minimalista_Expressiva', 'Minimalista', 'Expressiva');

        // Gera HTML
        mirrorContainer.innerHTML = `
            <p><strong>Sua marca parece querer transmitir:</strong><br>
            ${atributosFormatados}</p>

            <p><strong>Mas não quer ser:</strong><br>
            ${negativosFormatados}</p>

            <p><strong>Seu público procura:</strong><br>
            ${publicoFormatado}</p>

            <p><strong>Você quer se diferenciar por:</strong><br>
            <i>"${diferencial}"</i></p>

            <p><strong>Seu território (Posicionamento):</strong><br>
            • ${eixo1}<br>
            • ${eixo2}<br>
            • ${eixo3}</p>
        `;
    }

    // ==========================================================================
    // 5. ENVIO SILENCIOSO (AJAX)
    // ==========================================================================
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Validar etapa final
        if(!validateStep(currentStep)) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn ? (submitBtn.querySelector('strong') || submitBtn) : null;
        const originalText = btnText ? btnText.textContent : 'Enviar';

        if (submitBtn) {
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';
            if (btnText) btnText.textContent = "Processando Descoberta...";
        }

        const data = new FormData(form);
        const formDataObj = {};
        
        for (let [key, value] of data.entries()) {
            if (formDataObj[key]) {
                if (Array.isArray(formDataObj[key])) {
                    formDataObj[key].push(value);
                } else {
                    formDataObj[key] = [formDataObj[key], value];
                }
            } else {
                formDataObj[key] = value;
            }
        }

        // Convert arrays to comma-separated strings
        for (let key in formDataObj) {
            if (Array.isArray(formDataObj[key])) {
                formDataObj[key] = formDataObj[key].join(', ');
            }
        }

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formDataObj)
            });

            if (response.ok) {
                const successMessage = document.createElement('div');
                successMessage.className = 'success-feedback';
                successMessage.innerHTML = `
                    <div style="text-align: center; padding: 4rem 1rem; animation: fadeIn 0.8s ease-out;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--button-bg-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h2 style="font-family: var(--font-headline); font-size: 2.2rem; color: var(--button-bg-color); margin-bottom: 1rem;">Brand Discovery Concluído!</h2>
                        <p style="font-size: 1.1rem; color: var(--text-color-dark); opacity: 0.9; max-width: 400px; margin: 0 auto;">
                            Recebemos todas as suas informações com sucesso.<br><br>
                            Fique de olho no seu <strong>WhatsApp</strong>, nossa automação já está processando sua estratégia e eu entrarei em contato em breve!
                        </p>
                    </div>
                `;
                
                form.parentNode.replaceChild(successMessage, form);
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } else {
                const apiErrorText = await response.text();
                throw new Error('Erro do servidor: ' + apiErrorText);
            }

        } catch (error) {
            console.error("Erro ao enviar Brand Discovery:", error);
            alert("Erro: " + error.message + " - Por favor, tente novamente ou nos avise no WhatsApp.");
            
            if (submitBtn) {
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
                if (btnText) btnText.textContent = originalText;
            }
        }
    });

});

const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
