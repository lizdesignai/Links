/**
 * LIZ DESIGN - FORMS MAIN JS
 * Arquivo responsável pela inteligência, validação e envio dos formulários.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================================================
    // 1. AUTO-RESIZE PARA TEXTAREAS (UX Premium)
    // ==========================================================================
    const textareas = document.querySelectorAll('textarea');

    function autoResize() {
        this.style.height = 'auto'; // Reseta a altura
        this.style.height = (this.scrollHeight) + 'px'; // Ajusta para o conteúdo real
    }

    textareas.forEach(textarea => {
        // Ajusta a altura inicial (caso o navegador preencha dados automáticos)
        textarea.setAttribute('style', 'height:' + (textarea.scrollHeight) + 'px;overflow-y:hidden;');
        // Adiciona o ouvinte para crescer conforme digita
        textarea.addEventListener('input', autoResize, false);
    });


    // ==========================================================================
    // 2. MÁSCARA INTELIGENTE DE WHATSAPP (Garante o sucesso da Automação)
    // ==========================================================================
    const whatsappInputs = document.querySelectorAll('input[type="tel"], input[id*="whatsapp" i], input[name*="whatsapp" i]');

    whatsappInputs.forEach(input => {
        input.addEventListener('input', function (e) {
            let value = e.target.value;
            
            // Remove tudo o que não for número
            value = value.replace(/\D/g, '');
            
            // Aplica a formatação: (XX) XXXXX-XXXX
            if (value.length > 0) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            }
            
            // Limita a 15 caracteres: (99) 99999-9999
            e.target.value = value.substring(0, 15);
        });
    });


    // ==========================================================================
    // 3. LÓGICA MULTI-STEP E VALIDAÇÃO RIGOROSA
    // ==========================================================================
    const formsWithSteps = document.querySelectorAll('form.sophisticated-form');

    formsWithSteps.forEach(form => {
        const steps = form.querySelectorAll('.form-step');
        
        if (steps.length === 0) return;

        let currentStep = 0;
        const progressBar = document.getElementById('progress-bar');

        function updateProgress() {
            if (progressBar) {
                const percent = ((currentStep + 1) / steps.length) * 100;
                progressBar.style.width = percent + '%';
            }
        }

        function showStep(index) {
            steps.forEach((step, i) => {
                step.style.display = (i === index) ? 'block' : 'none';
            });
            currentStep = index; // Sincroniza o passo atual
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Compartilha a função showStep com o objeto do formulário para acesso externo (Seção 4)
        form.showStep = showStep;

        function validateStep(index) {
            const currentStepEl = steps[index];
            const requiredInputs = currentStepEl.querySelectorAll('input[required], textarea[required], select[required]');
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
                    if (currentStep >= steps.length) {
                        currentStep = steps.length - 1;
                    }
                    showStep(currentStep);
                }
            });
        });

        const prevBtns = form.querySelectorAll('.btn-prev');
        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentStep--;
                if (currentStep < 0) {
                    currentStep = 0;
                }
                showStep(currentStep);
            });
        });

        showStep(currentStep);
    });


    // ==========================================================================
    // 4. ENVIO SILENCIOSO (AJAX) VIA FORMSPREE COM TRATAMENTO DE ERROS OCULTOS
    // ==========================================================================
    const forms = document.querySelectorAll('form.sophisticated-form');

    forms.forEach(form => {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            // --- SEGURANÇA SÊNIOR: Validação de campos em abas ocultas ---
            const allRequired = Array.from(
    form.querySelectorAll('input[required], textarea[required], select[required]')
).filter(input => input.offsetParent !== null);
            for (let input of allRequired) {
                if (!input.checkValidity()) {
                    // Se o erro está em uma aba escondida, encontra e viaja até ela
                    const parentStep = input.closest('.form-step');
                    if (parentStep && parentStep.style.display === 'none') {
                        const stepIndex = Array.from(form.querySelectorAll('.form-step')).indexOf(parentStep);
                        if (typeof form.showStep === 'function') {
                            form.showStep(stepIndex);
                        }
                    }
                    input.reportValidity();
                    return; // Aborta o envio para que o usuário corrija
                }
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn ? (submitBtn.querySelector('strong') || submitBtn) : null;
            const originalText = btnText ? btnText.textContent : 'Enviar';

            if (submitBtn) {
                submitBtn.style.opacity = '0.7';
                submitBtn.style.pointerEvents = 'none';
                if (btnText) btnText.textContent = "Processando e Enviando...";
            }

            const data = new FormData(form);
            const actionUrl = form.getAttribute('action');

            try {
                const response = await fetch(actionUrl, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
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
                            <h2 style="font-family: var(--font-headline); font-size: 2.2rem; color: var(--button-bg-color); margin-bottom: 1rem;">Tudo certo!</h2>
                            <p style="font-size: 1.1rem; color: var(--text-color-dark); opacity: 0.9; max-width: 400px; margin: 0 auto;">
                                Suas respostas foram enviadas com sucesso!<br><br>
                                Fique de olho no seu <strong>WhatsApp</strong>, nossa automação já está processando suas informações e eu entrarei em contato em breve!
                            </p>
                        </div>
                    `;
                    
                    form.parentNode.replaceChild(successMessage, form);
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                } else {
                    throw new Error('Erro na resposta do servidor.');
                }

            } catch (error) {
                console.error("Erro ao enviar formulário:", error);
                alert("Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato pelo WhatsApp.");
                
                if (submitBtn) {
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'auto';
                    if (btnText) btnText.textContent = originalText;
                }
            }
        });
    });

});

// Estilo extra simples para animação de sucesso caso não esteja no CSS
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);