document.addEventListener('DOMContentLoaded', function () {

    // ==================================
    // --- LÓGICA DO PRE-LOADER ---
    // ==================================
    const preloader = document.getElementById('preloader');
    
    if (preloader) {
        // Usa o evento load da janela para garantir que tudo (imagens, etc) carregou
        window.addEventListener('load', function() {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 2500); // 2.5s para bater com a animação do SVG
        });
        
        // Fallback de segurança: se o 'load' já passou (em caso de cache), esconde mesmo assim
        if (document.readyState === 'complete') {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 2500);
        }
    }

    // ==================================
    // --- 1. Inicialização do Swiper.js ---
    // ==================================
    const swiperElement = document.querySelector('.swiper');
    
    // Verificação de segurança: só inicializa se a classe '.swiper' existir na página
    if (swiperElement) {
        const swiper = new Swiper('.swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },

            loop: true,
        });
    }

    // ==================================
    // --- 2. Lógica para o Modal do Portfólio ---
    // ==================================
    const modal = document.getElementById('portfolio-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModal = document.querySelector('.close-button');
    const slides = document.querySelectorAll('.swiper-slide');

    // Só executa a lógica se os elementos do modal existirem
    if (modal && modalTitle && modalDescription) {
        
        function openModal(title, description) {
            // Fallback (|| '') para não mostrar "null" caso o atributo não exista
            modalTitle.textContent = title || '';
            modalDescription.textContent = description || '';
            modal.classList.add('active');
        }

        function hideModal() {
            modal.classList.remove('active');
        }

        if (slides.length > 0) {
            slides.forEach(slide => {
                slide.addEventListener('click', () => {
                    // Apenas abre o modal se o slide clicado for o central (ativo)
                    if (slide.classList.contains('swiper-slide-active')) {
                        const title = slide.getAttribute('data-title');
                        const description = slide.getAttribute('data-description');
                        openModal(title, description);
                    }
                });
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', hideModal);
        }

        // Fechar ao clicar fora da caixa branca
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                hideModal();
            }
        });

        // Fechar com a tecla ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                hideModal();
            }
        });
    }

    // ==================================
    // --- 3. LÓGICA DA CHAVE (TOGGLE) ---
    // ==================================
    const btnLinks = document.getElementById('btn-links');
    const btnSobre = document.getElementById('btn-sobre');
    const contentLinks = document.getElementById('content-links');
    const contentSobre = document.getElementById('content-sobre');
    const shimmerButton = document.querySelector('.shimmer-button');

    if (btnLinks && btnSobre && contentLinks && contentSobre) {

        function showLinksView() {
            btnLinks.classList.add('active');
            contentLinks.classList.add('active');
            
            btnSobre.classList.remove('active');
            contentSobre.classList.remove('active');
        }

        function showSobreView() {
            btnSobre.classList.add('active');
            contentSobre.classList.add('active');

            btnLinks.classList.remove('active');
            contentLinks.classList.remove('active');

            // Dispara a animação do botão "shimmer" do manifesto
            if (shimmerButton) {
                shimmerButton.classList.remove('animate-shimmer');
                void shimmerButton.offsetWidth; // Truque: Força o "reflow" do navegador para reiniciar a animação
                shimmerButton.classList.add('animate-shimmer');
            }
        }

        btnLinks.addEventListener('click', showLinksView);
        btnSobre.addEventListener('click', showSobreView);
    }

}); // Fim do 'DOMContentLoaded'