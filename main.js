document.addEventListener('DOMContentLoaded', function () {

<<<<<<< HEAD
    // ==================================
    // --- LÓGICA DO PRE-LOADER ---
    // ==================================
    const preloader = document.getElementById('preloader');
    
    // Só adiciona o ouvinte de 'load' se o preloader existir na página
    if (preloader) {
        window.addEventListener('load', function() {
=======
    // --- LÓGICA DO PRE-LOADER ---
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
>>>>>>> a538973b46a1516696c9bc60eeea11b0bedda65b
            // Define um tempo para a animação do SVG acontecer antes de esconder
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 2500); // 3.5 segundos (2.5s para desenhar + 1s para preencher)
<<<<<<< HEAD
        });
    }

    // ==================================
    // --- 1. Inicialização do Swiper.js ---
    // ==================================
    const swiperElement = document.querySelector('.swiper');
    
    // Verificação de segurança: só inicializa o Swiper se a classe '.swiper' existir
    if (swiperElement) {
        const swiper = new Swiper('.swiper', {
            // Ativa o efeito de "coverflow" (perspectiva 3D)
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
            
            // Ativa a navegação por setas
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },

            // Loop infinito (opcional)
            loop: true,
        });
    }

    // ==================================
    // --- 2. Lógica para o Modal do Portfólio ---
    // ==================================
=======
        }
    });

    // --- 1. Inicialização do Swiper.js ---
    const swiper = new Swiper('.swiper', {
        // Ativa o efeito de "coverflow" (perspectiva 3D)
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
        
        // Ativa a navegação por setas
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        // Loop infinito (opcional)
        loop: true,
    });

    // --- 2. Lógica para o Modal do Portfólio ---
>>>>>>> a538973b46a1516696c9bc60eeea11b0bedda65b
    const modal = document.getElementById('portfolio-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModal = document.querySelector('.close-button');
    const slides = document.querySelectorAll('.swiper-slide');

<<<<<<< HEAD
    // Verificação de segurança: só executa se o modal existir
    if (modal && modalTitle && modalDescription) {
        
        // Função para abrir o modal
        function openModal(title, description) {
            // Adicionado fallback (|| '') caso o atributo não exista no HTML
            modalTitle.textContent = title || '';
            modalDescription.textContent = description || '';
            modal.classList.add('active');
        }

        // Função para fechar o modal
        function hideModal() {
            modal.classList.remove('active');
        }

        // Adiciona o evento de clique a cada slide
        if (slides.length > 0) {
            slides.forEach(slide => {
                slide.addEventListener('click', () => {
                    // Apenas abre o modal se o slide clicado for o ativo (central)
                    if (slide.classList.contains('swiper-slide-active')) {
                        const title = slide.getAttribute('data-title');
                        const description = slide.getAttribute('data-description');
                        openModal(title, description);
                    }
                });
            });
        }

        // Adiciona evento para fechar o modal no botão 'X'
        if (closeModal) {
            closeModal.addEventListener('click', hideModal);
        }

        // Adiciona evento para fechar o modal ao clicar fora do conteúdo
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                hideModal();
            }
        });

        // Adiciona evento para fechar o modal com a tecla 'Escape'
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                hideModal();
            }
        });
    }

    // ==================================
    //    --- 3. LÓGICA DA CHAVE (TOGGLE) ---
=======
    // Função para abrir o modal
    function openModal(title, description) {
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modal.classList.add('active');
    }

    // Função para fechar o modal
    function hideModal() {
        modal.classList.remove('active');
    }

    // Adiciona o evento de clique a cada slide
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            // Apenas abre o modal se o slide clicado for o ativo (central)
            if (slide.classList.contains('swiper-slide-active')) {
                const title = slide.getAttribute('data-title');
                const description = slide.getAttribute('data-description');
                openModal(title, description);
            }
        });
    });

    // Adiciona evento para fechar o modal no botão 'X'
    closeModal.addEventListener('click', hideModal);

    // Adiciona evento para fechar o modal ao clicar fora do conteúdo
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Adiciona evento para fechar o modal com a tecla 'Escape'
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            hideModal();
        }
    });


    // ==================================
    //    --- 3. CÓDIGO NOVO ---
    //    LÓGICA DA CHAVE (TOGGLE)
>>>>>>> a538973b46a1516696c9bc60eeea11b0bedda65b
    // ==================================
    
    // 1. Seleciona os elementos da chave e das vistas
    const btnLinks = document.getElementById('btn-links');
    const btnSobre = document.getElementById('btn-sobre');
    const contentLinks = document.getElementById('content-links');
    const contentSobre = document.getElementById('content-sobre');
    
    // Seleciona o botão que terá a animação de brilho
    const shimmerButton = document.querySelector('.shimmer-button');

<<<<<<< HEAD
    // Verificação de segurança: só executa se a estrutura de abas existir
    if (btnLinks && btnSobre && contentLinks && contentSobre) {

        // 2. Função para mostrar a vista de "Links"
        function showLinksView() {
            // Ativa o botão e a vista de Links
            btnLinks.classList.add('active');
            contentLinks.classList.add('active');
            
            // Desativa o botão e a vista de Sobre
            btnSobre.classList.remove('active');
            contentSobre.classList.remove('active');
        }

        // 3. Função para mostrar a vista de "Sobre"
        function showSobreView() {
            // Ativa o botão e a vista de Sobre
            btnSobre.classList.add('active');
            contentSobre.classList.add('active');

            // Desativa o botão e a vista de Links
            btnLinks.classList.remove('active');
            contentLinks.classList.remove('active');

            // 4. Lógica para disparar a animação do botão "shimmer"
            if (shimmerButton) {
                // Remove a classe de animação (caso já exista)
                shimmerButton.classList.remove('animate-shimmer');
                
                // Força o "reflow" do navegador para reiniciar a animação CSS
                void shimmerButton.offsetWidth; 
                
                // Adiciona a classe que inicia a animação CSS
                shimmerButton.classList.add('animate-shimmer');
            }
        }

        // 5. Adiciona os "ouvintes" de clique aos botões da chave
        btnLinks.addEventListener('click', showLinksView);
        btnSobre.addEventListener('click', showSobreView);
    }

}); // <-- Fim do 'DOMContentLoaded'
=======
    // 2. Função para mostrar a vista de "Links"
    function showLinksView() {
        // Ativa o botão e a vista de Links
        btnLinks.classList.add('active');
        contentLinks.classList.add('active');
        
        // Desativa o botão e a vista de Sobre
        btnSobre.classList.remove('active');
        contentSobre.classList.remove('active');
    }

    // 3. Função para mostrar a vista de "Sobre"
    function showSobreView() {
        // Ativa o botão e a vista de Sobre
        btnSobre.classList.add('active');
        contentSobre.classList.add('active');

        // Desativa o botão e a vista de Links
        btnLinks.classList.remove('active');
        contentLinks.classList.remove('active');

        // 4. Lógica para disparar a animação do botão "shimmer"
        
        // Remove a classe de animação (caso já exista)
        shimmerButton.classList.remove('animate-shimmer');
        
        // Força o "reflow" do navegador (truque moderno)
        // Isto garante que a animação CSS reinicia se clicares várias vezes
        void shimmerButton.offsetWidth; 
        
        // Adiciona a classe que inicia a animação CSS
        shimmerButton.classList.add('animate-shimmer');
    }

    // 5. Adiciona os "ouvintes" de clique aos botões da chave
    btnLinks.addEventListener('click', showLinksView);
    btnSobre.addEventListener('click', showSobreView);

}); // <-- Fim do 'DOMContentLoaded'
>>>>>>> a538973b46a1516696c9bc60eeea11b0bedda65b
