/**
 * LIZ DESIGN - BRAND EXPERIENCE JS
 * Motor de lógica para a pesquisa avançada de Brand Experience.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================================================
    // 1. AUTO-RESIZE PARA TEXTAREAS & MÁSCARAS
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
    const form = document.getElementById('brand-experience-form');
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

    form.showStep = showStep;

    function validateStep(index) {
        const currentStepEl = steps[index];
        const requiredInputs = Array.from(currentStepEl.querySelectorAll('input[required], textarea[required], select[required]')).filter(el => {
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
        
        if(isValid) {
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
    // 3. LÓGICA CONDICIONAL
    // ==========================================================================
    
    form.addEventListener('change', function(e) {
        const target = e.target;
        
        // Limites de checkbox em tempo real
        const limitGroup = target.closest('.limit-checkboxes');
        if (limitGroup && target.type === 'checkbox') {
            const limit = parseInt(limitGroup.getAttribute('data-limit'));
            const checked = limitGroup.querySelectorAll('input[type="checkbox"]:checked').length;
            if (checked > limit) {
                target.checked = false;
                alert(`Você só pode selecionar até ${limit} opções neste campo.`);
            }
        }

        // Lógica NPS
        if (target.name === 'NPS') {
            const npsVal = parseInt(target.value);
            document.getElementById('nps-0-6').style.display = 'none';
            document.getElementById('nps-7-8').style.display = 'none';
            document.getElementById('nps-9-10').style.display = 'none';
            
            document.getElementById('nps_motivo_0_6').required = false;
            document.getElementById('nps_motivo_7_8').required = false;
            document.getElementById('nps_motivo_9_10').required = false;

            if (npsVal <= 6) {
                document.getElementById('nps-0-6').style.display = 'block';
                document.getElementById('nps_motivo_0_6').required = true;
            } else if (npsVal <= 8) {
                document.getElementById('nps-7-8').style.display = 'block';
                document.getElementById('nps_motivo_7_8').required = true;
            } else {
                document.getElementById('nps-9-10').style.display = 'block';
                document.getElementById('nps_motivo_9_10').required = true;
            }
        }

        // Lógica Percebeu Mudança
        if (target.name === 'Percebeu_Mudanca') {
            const conditional = document.querySelector('.logic-mudanca');
            const textarea = document.getElementById('mudanca_qual');
            if (target.value.startsWith('Sim')) {
                conditional.style.display = 'block';
                textarea.required = true;
            } else {
                conditional.style.display = 'none';
                textarea.required = false;
            }
        }

        // Lógica Recebeu Comentario
        if (target.name === 'Recebeu_Comentario') {
            const conditional = document.querySelector('.logic-comentario');
            const textarea = document.getElementById('o_que_disseram');
            if (target.value === 'Sim') {
                conditional.style.display = 'block';
                textarea.required = true;
            } else {
                conditional.style.display = 'none';
                textarea.required = false;
            }
        }

        // Lógica Novo Contato
        if (target.name === 'Novo_Contato') {
            const conditional = document.querySelector('.logic-contato');
            const textarea = document.getElementById('assunto_contato');
            if (target.value === 'Sim') {
                conditional.style.display = 'block';
                textarea.required = true;
            } else {
                conditional.style.display = 'none';
                textarea.required = false;
            }
        }

    });

    // ==========================================================================
    // 4. CONVERSÃO DE IMAGEM PARA BASE64 (UPLOAD DE PRINT)
    // ==========================================================================
    const printFile = document.getElementById('print_file');
    const printBase64 = document.getElementById('print_base64');
    const fileStatus = document.getElementById('file_status');

    if(printFile) {
        printFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) {
                printBase64.value = '';
                fileStatus.textContent = '';
                return;
            }
            
            // Limitar tamanho (ex: 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem é muito grande. O limite é 5MB.');
                printFile.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                printBase64.value = event.target.result;
                fileStatus.textContent = 'Imagem carregada e pronta para envio!';
                fileStatus.style.color = 'green';
            };
            reader.readAsDataURL(file);
        });
    }

    // ==========================================================================
    // 5. ENVIO SILENCIOSO (AJAX)
    // ==========================================================================
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if(!validateStep(currentStep)) return;

        // Consolidar NPS Motivo para a tabela do banco de forma unificada se desejado
        // A tabela tem apenas nps_motivo, então eu pego do input que estiver visível
        const npsVal = parseInt(document.querySelector('input[name="NPS"]:checked').value);
        let motivo = '';
        if (npsVal <= 6) motivo = document.getElementById('nps_motivo_0_6').value;
        else if (npsVal <= 8) motivo = document.getElementById('nps_motivo_7_8').value;
        else motivo = document.getElementById('nps_motivo_9_10').value;
        
        document.getElementById('nps_motivo_hidden').value = motivo;

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn ? (submitBtn.querySelector('strong') || submitBtn) : null;
        const originalText = btnText ? btnText.textContent : 'Enviar';

        if (submitBtn) {
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';
            if (btnText) btnText.textContent = "Enviando...";
        }

        const data = new FormData(form);
        const formDataObj = {};
        
        for (let [key, value] of data.entries()) {
            // Ignorar os campos individuais do NPS para não poluir
            if(key === 'NPS_Motivo_0_6' || key === 'NPS_Motivo_7_8' || key === 'NPS_Motivo_9_10') continue;

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
                        <h2 style="font-family: var(--font-headline); font-size: 2.2rem; color: var(--button-bg-color); margin-bottom: 1rem;">Obrigada!</h2>
                        <p style="font-size: 1.1rem; color: var(--text-color-dark); opacity: 0.9; max-width: 400px; margin: 0 auto;">
                            Sua avaliação foi enviada com sucesso.<br><br>
                            Muito obrigada pelo seu tempo. Em breve entrarei em contato com você!
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
            console.error("Erro ao enviar form:", error);
            alert("Erro: " + error.message);
            
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
