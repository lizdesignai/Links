/**
 * LIZ DESIGN / STUDIO VERONNA - FORM AUTO-SAVE & DRAFT SHARING
 * 
 * Opção 1: Salva automaticamente no LocalStorage em tempo real.
 * Opção 2: Permite clicar em "Salvar e continuar depois", gerando um link exclusivo
 *          no banco de dados Neon para o cliente copiar e abrir em qualquer dispositivo.
 */

(function () {
    'use strict';

    function getFormStorageKey(form) {
        const path = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const formId = form.id || form.getAttribute('name') || 'form';
        return `liz_draft_${path}_${formId}`;
    }

    function getActiveStepIndex(form) {
        const steps = form.querySelectorAll('.form-step');
        if (steps.length === 0) return 0;
        for (let i = 0; i < steps.length; i++) {
            if (steps[i].style.display !== 'none') {
                return i;
            }
        }
        return 0;
    }

    function serializeFormData(form) {
        const data = {};
        const elements = form.elements;

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const name = el.name;

            if (!name || el.disabled) continue;
            if (['submit', 'button', 'reset'].includes(el.type)) continue;
            if (['_gotcha', '_subject'].includes(name)) continue;

            if (el.type === 'radio') {
                if (el.checked) {
                    data[name] = el.value;
                }
            } else if (el.type === 'checkbox') {
                if (!data[name]) {
                    data[name] = [];
                }
                if (el.checked) {
                    if (Array.isArray(data[name])) {
                        data[name].push(el.value);
                    }
                }
            } else {
                data[name] = el.value;
            }
        }

        data.__currentStep = getActiveStepIndex(form);
        data.__savedAt = Date.now();

        return data;
    }

    function hasMeaningfulData(savedData) {
        if (!savedData || typeof savedData !== 'object') return false;
        
        let meaningfulCount = 0;
        for (const key of Object.keys(savedData)) {
            if (key.startsWith('__')) continue;
            const val = savedData[key];
            if (Array.isArray(val) && val.length > 0) meaningfulCount++;
            else if (typeof val === 'string' && val.trim().length > 0) meaningfulCount++;
        }
        return meaningfulCount > 0;
    }

    function restoreFormData(form, savedData) {
        if (!savedData) return;

        const elements = form.elements;
        const touchedInputs = [];

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const name = el.name;
            if (!name || savedData[name] === undefined) continue;

            const savedVal = savedData[name];

            if (el.type === 'radio') {
                if (el.value === savedVal) {
                    el.checked = true;
                    touchedInputs.push(el);
                }
            } else if (el.type === 'checkbox') {
                if (Array.isArray(savedVal)) {
                    el.checked = savedVal.includes(el.value);
                } else {
                    el.checked = (el.value === savedVal || savedVal === true);
                }
                if (el.checked) touchedInputs.push(el);
            } else {
                el.value = savedVal;
                touchedInputs.push(el);
            }
        }

        touchedInputs.forEach(el => {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Restaura seleções visuais (específico para Brand Discovery)
        const visualChoiceItems = form.querySelectorAll('.visual-choice-item');
        visualChoiceItems.forEach(item => {
            const val = item.getAttribute('data-value');
            const inputName = item.getAttribute('data-input');
            if (inputName && savedData[inputName] === val) {
                item.classList.add('selected');
            }
        });

        // Restaura o passo salvo
        const targetStep = typeof savedData.__currentStep === 'number' ? savedData.__currentStep : savedData.current_step;
        if (typeof targetStep === 'number' && targetStep > 0) {
            setTimeout(() => {
                if (typeof form.showStep === 'function') {
                    form.showStep(targetStep);
                } else {
                    const steps = form.querySelectorAll('.form-step');
                    steps.forEach((step, idx) => {
                        step.style.display = (idx === targetStep) ? 'block' : 'none';
                    });
                    const progressBar = document.getElementById('progress-bar');
                    if (progressBar && steps.length > 1) {
                        progressBar.style.width = ((targetStep + 1) / steps.length * 100) + '%';
                    }
                }
            }, 150);
        }
    }

    // Modal de exibição e cópia do link exclusivo
    function showDraftLinkModal(draftUrl) {
        let existingModal = document.getElementById('draft-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'draft-modal';
        modal.className = 'draft-modal-backdrop';
        modal.innerHTML = `
            <div class="draft-modal-box">
                <div class="draft-modal-badge">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                </div>
                <div class="draft-modal-header">
                    <h3>Seu progresso está salvo!</h3>
                    <p>Copie seu link exclusivo abaixo para continuar o preenchimento a qualquer momento, de qualquer celular ou computador.</p>
                </div>
                <div class="draft-modal-body">
                    <div class="draft-url-box">
                        <input type="text" readonly value="${draftUrl}" id="draft-url-input">
                        <button type="button" id="btn-copy-draft-link">
                            <span id="copy-btn-text">Copiar Link</span>
                        </button>
                    </div>
                    <div class="draft-modal-tip">
                        💡 <strong>Dica:</strong> Cole este link no seu WhatsApp, bloco de notas ou envie para você mesmo para não esquecer.
                    </div>
                </div>
                <div class="draft-modal-footer">
                    <button type="button" class="btn-continue-now" id="btn-close-draft-modal">
                        Continuar preenchendo agora
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const copyBtn = modal.querySelector('#btn-copy-draft-link');
        const copyInput = modal.querySelector('#draft-url-input');
        const copyText = modal.querySelector('#copy-btn-text');

        function copyLink() {
            copyInput.select();
            copyInput.setSelectionRange(0, 99999);

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(draftUrl).then(onCopiedSuccess).catch(() => {
                    document.execCommand('copy');
                    onCopiedSuccess();
                });
            } else {
                document.execCommand('copy');
                onCopiedSuccess();
            }
        }

        function onCopiedSuccess() {
            copyBtn.classList.add('copied');
            copyText.textContent = '✓ Link Copiado!';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyText.textContent = 'Copiar Link';
            }, 3000);
        }

        copyBtn.addEventListener('click', copyLink);
        copyInput.addEventListener('click', copyLink);

        const closeBtn = modal.querySelector('#btn-close-draft-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Dispara a criação do link de rascunho na nuvem
    async function handleSaveAndShareLink(form, triggerBtn) {
        const originalText = triggerBtn ? triggerBtn.innerHTML : '';
        if (triggerBtn) {
            triggerBtn.style.pointerEvents = 'none';
            triggerBtn.innerHTML = '<span>Salvando na nuvem...</span>';
        }

        try {
            const formData = serializeFormData(form);

            if (!hasMeaningfulData(formData)) {
                alert('Preencha pelo menos um campo do formulário antes de salvar.');
                return;
            }

            const path = window.location.pathname.split('/').pop().replace('.html', '') || 'form';
            const formId = form.id || 'form';

            const payload = {
                draft_id: form._currentDraftId || null,
                form_id: formId,
                form_path: path,
                current_step: getActiveStepIndex(form),
                dados: formData
            };

            const response = await fetch('/api/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar rascunho no servidor.');
            }

            const result = await response.json();
            if (result.success && result.draft_id) {
                form._currentDraftId = result.draft_id;
                
                // Salva o ID no localStorage para continuar atualizando o mesmo link
                try {
                    const storageKey = getFormStorageKey(form) + '_cloud_id';
                    localStorage.setItem(storageKey, result.draft_id);
                } catch (e) {}

                // Constrói o link completo
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('draft', result.draft_id);
                const draftUrl = currentUrl.toString();

                showDraftLinkModal(draftUrl);
            } else {
                throw new Error(result.error || 'Erro ao gerar link.');
            }

        } catch (error) {
            console.error('Save Draft Error:', error);
            alert('Não foi possível gerar o link de salvamento no momento. Suas respostas continuam salvas com segurança no seu navegador.');
        } finally {
            if (triggerBtn) {
                triggerBtn.style.pointerEvents = 'auto';
                triggerBtn.innerHTML = originalText;
            }
        }
    }

    // Injeta o status de salvamento e o botão de gerar link
    function injectStatusIndicator(form) {
        let statusEl = document.getElementById('autosave-status');
        if (statusEl) return statusEl;

        statusEl = document.createElement('div');
        statusEl.id = 'autosave-status';
        statusEl.className = 'autosave-status';
        statusEl.innerHTML = `
            <span class="autosave-status-dot"></span>
            <span class="autosave-status-text">Progresso salvo no navegador</span>
            <span style="opacity: 0.4;">|</span>
            <button type="button" class="btn-save-draft-action" id="btn-save-draft-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Salvar e continuar depois
            </button>
        `;

        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer && progressContainer.parentNode) {
            progressContainer.parentNode.insertBefore(statusEl, progressContainer.nextSibling);
        } else {
            form.insertBefore(statusEl, form.firstChild);
        }

        const draftBtn = statusEl.querySelector('#btn-save-draft-link');
        if (draftBtn) {
            draftBtn.addEventListener('click', () => {
                handleSaveAndShareLink(form, draftBtn);
            });
        }

        return statusEl;
    }

    // Banner de aviso de recuperação
    function injectDraftRecoveryNotice(form, messageTitle, messageDesc, onClear) {
        let notice = document.getElementById('draft-notice');
        if (notice) notice.remove();

        notice = document.createElement('div');
        notice.id = 'draft-notice';
        notice.className = 'draft-notice';
        notice.innerHTML = `
            <div class="draft-notice-content">
                <div class="draft-notice-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                </div>
                <div class="draft-notice-text">
                    <strong>${messageTitle || 'Progresso recuperado!'}</strong>
                    <span>${messageDesc || 'Restauramos suas respostas para você continuar exatamente de onde parou.'}</span>
                </div>
            </div>
            <div class="draft-notice-actions">
                <button type="button" class="draft-notice-clear" id="btn-draft-clear">Recomeçar do zero</button>
                <button type="button" class="draft-notice-close" id="btn-draft-close" aria-label="Fechar aviso">✕</button>
            </div>
        `;

        form.parentNode.insertBefore(notice, form);

        const btnClear = notice.querySelector('#btn-draft-clear');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (confirm('Deseja realmente apagar o rascunho salvo e recomeçar o formulário do zero?')) {
                    if (typeof onClear === 'function') onClear();
                    notice.remove();
                }
            });
        }

        const btnClose = notice.querySelector('#btn-draft-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                notice.remove();
            });
        }
    }

    // Injeta também um botão secundário sutil nos botões de navegação de cada etapa
    function injectNavDraftButtons(form) {
        const navContainers = form.querySelectorAll('.form-navigation');
        navContainers.forEach(nav => {
            if (nav.querySelector('.btn-save-draft-action')) return;

            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'btn-save-draft-action';
            saveBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Salvar para continuar depois
            `;

            saveBtn.addEventListener('click', () => {
                handleSaveAndShareLink(form, saveBtn);
            });

            // Insere no container de navegação de forma harmoniosa
            nav.appendChild(saveBtn);
        });
    }

    // Inicialização principal
    async function initAutoSaveForForm(form) {
        const storageKey = getFormStorageKey(form);
        const cloudIdKey = storageKey + '_cloud_id';
        const statusEl = injectStatusIndicator(form);
        injectNavDraftButtons(form);

        // Recupera ID na nuvem se já foi gerado antes
        try {
            form._currentDraftId = localStorage.getItem(cloudIdKey) || null;
        } catch (e) {}

        let saveTimeout = null;

        function updateStatus(state) {
            if (!statusEl) return;
            const textEl = statusEl.querySelector('.autosave-status-text');
            if (state === 'saving') {
                statusEl.classList.add('saving');
                if (textEl) textEl.textContent = 'Salvando respostas...';
            } else if (state === 'saved') {
                statusEl.classList.remove('saving');
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (textEl) textEl.textContent = `Progresso salvo às ${timeStr}`;
            }
        }

        function saveLocalNow() {
            try {
                const data = serializeFormData(form);
                if (hasMeaningfulData(data)) {
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    updateStatus('saved');
                }
            } catch (err) {
                console.warn('AutoSave Storage Error:', err);
            }
        }

        function triggerDebouncedSave() {
            updateStatus('saving');
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveLocalNow, 350);
        }

        function clearDraft() {
            try {
                localStorage.removeItem(storageKey);
                localStorage.removeItem(cloudIdKey);
                form._currentDraftId = null;
                form.reset();
                if (typeof form.showStep === 'function') {
                    form.showStep(0);
                }
                const textEl = statusEl ? statusEl.querySelector('.autosave-status-text') : null;
                if (textEl) textEl.textContent = 'Formulário limpo';
            } catch (err) {
                console.warn('AutoSave Clear Error:', err);
            }
        }

        // =====================================================================
        // 1. VERIFICA SE ESTÁ ABRINDO POR LINK DE RETORNO (?draft=XXXXX)
        // =====================================================================
        const urlParams = new URLSearchParams(window.location.search);
        const queryDraftId = urlParams.get('draft') || urlParams.get('rascunho');

        let restoredFromCloud = false;

        if (queryDraftId) {
            try {
                const textEl = statusEl ? statusEl.querySelector('.autosave-status-text') : null;
                if (textEl) textEl.textContent = 'Carregando suas respostas da nuvem...';

                const response = await fetch('/api/draft?id=' + encodeURIComponent(queryDraftId));
                if (response.ok) {
                    const json = await response.json();
                    if (json.success && json.draft && json.draft.dados) {
                        form._currentDraftId = queryDraftId;
                        try { localStorage.setItem(cloudIdKey, queryDraftId); } catch (e) {}

                        // Restaura no form e sincroniza no LocalStorage
                        restoreFormData(form, json.draft.dados);
                        localStorage.setItem(storageKey, JSON.stringify(json.draft.dados));
                        restoredFromCloud = true;

                        injectDraftRecoveryNotice(
                            form,
                            'Progresso carregado via link!',
                            'Restauramos suas respostas salvas na nuvem. Você pode continuar preenchendo de onde parou.',
                            clearDraft
                        );

                        if (textEl) textEl.textContent = 'Progresso sincronizado da nuvem';
                    }
                }
            } catch (cloudErr) {
                console.warn('Erro ao carregar rascunho da nuvem:', cloudErr);
            }
        }

        // =====================================================================
        // 2. SE NÃO VEIO DA NUVEM, RESTAURA DO LOCALSTORAGE SE EXISTIR
        // =====================================================================
        if (!restoredFromCloud) {
            try {
                const rawDraft = localStorage.getItem(storageKey);
                if (rawDraft) {
                    const parsedDraft = JSON.parse(rawDraft);
                    if (hasMeaningfulData(parsedDraft)) {
                        restoreFormData(form, parsedDraft);
                        injectDraftRecoveryNotice(
                            form,
                            'Progresso recuperado!',
                            'Restauramos suas respostas para você continuar exatamente de onde parou.',
                            clearDraft
                        );
                    }
                }
            } catch (err) {
                console.warn('AutoSave Restore Error:', err);
            }
        }

        // =====================================================================
        // 3. FASE 3: CAPTURA SILENCIOSA DE LEADS (Lead Recovery na Nuvem)
        // =====================================================================
        async function syncToCloudSilently() {
            try {
                const formData = serializeFormData(form);
                if (!hasMeaningfulData(formData)) return;

                // Verifica se dados mínimos de contato já foram preenchidos
                let hasContact = false;
                for (const k of Object.keys(formData)) {
                    const lower = k.toLowerCase();
                    const val = String(formData[k] || '').trim();
                    if (val.length >= 2) {
                        if (lower.includes('nome') || lower.includes('whatsapp') || lower.includes('email') || lower.includes('insta')) {
                            hasContact = true;
                            break;
                        }
                    }
                }
                if (!hasContact) return;

                const path = window.location.pathname.split('/').pop().replace('.html', '') || 'form';
                const formId = form.id || 'form';

                const payload = {
                    draft_id: form._currentDraftId || null,
                    form_id: formId,
                    form_path: path,
                    current_step: getActiveStepIndex(form),
                    dados: formData,
                    status: 'em_andamento'
                };

                const response = await fetch('/api/draft', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.draft_id) {
                        form._currentDraftId = result.draft_id;
                        try { localStorage.setItem(cloudIdKey, result.draft_id); } catch (e) {}

                        // Garante que o input oculto _draft_id exista para o envio final
                        let hiddenDraftInput = form.querySelector('input[name="_draft_id"]');
                        if (!hiddenDraftInput) {
                            hiddenDraftInput = document.createElement('input');
                            hiddenDraftInput.type = 'hidden';
                            hiddenDraftInput.name = '_draft_id';
                            form.appendChild(hiddenDraftInput);
                        }
                        hiddenDraftInput.value = result.draft_id;
                    }
                }
            } catch (e) {
                // Silencioso em segundo plano
            }
        }

        // Se já temos um _currentDraftId prévio, garante que o input oculto exista no form
        if (form._currentDraftId) {
            let hiddenDraftInput = form.querySelector('input[name="_draft_id"]');
            if (!hiddenDraftInput) {
                hiddenDraftInput = document.createElement('input');
                hiddenDraftInput.type = 'hidden';
                hiddenDraftInput.name = '_draft_id';
                form.appendChild(hiddenDraftInput);
            }
            hiddenDraftInput.value = form._currentDraftId;
        }

        // 4. Ouvintes de eventos nos inputs e navegação
        form.addEventListener('input', triggerDebouncedSave);
        form.addEventListener('change', triggerDebouncedSave);

        const navButtons = form.querySelectorAll('.btn-next, .btn-prev, .visual-choice-item');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    saveLocalNow();
                    // Captura silenciosa em segundo plano no avanço das etapas
                    syncToCloudSilently();
                }, 150);
            });
        });

        // 5. Limpeza automática ao enviar com sucesso
        const formParent = form.parentNode;
        if (formParent) {
            const observer = new MutationObserver(() => {
                const successEl = formParent.querySelector('.success-feedback, .atelier-result-card');
                if (successEl) {
                    try {
                        localStorage.removeItem(storageKey);
                        localStorage.removeItem(cloudIdKey);
                        if (statusEl) statusEl.remove();
                    } catch (e) {}
                    observer.disconnect();
                }
            });
            observer.observe(formParent, { childList: true, subtree: true });
        }

        form._clearDraft = clearDraft;
    }

    function init() {
        const forms = document.querySelectorAll('form.sophisticated-form, form');
        forms.forEach(form => {
            if (form.querySelectorAll('input, textarea').length >= 3) {
                initAutoSaveForForm(form);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.FormAutoSave = {
        clear: function (formElement) {
            if (formElement && typeof formElement._clearDraft === 'function') {
                formElement._clearDraft();
            }
        }
    };

})();
