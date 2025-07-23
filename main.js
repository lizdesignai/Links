document.addEventListener('DOMContentLoaded', function () {

    // --- LÓGICA DO PRE-LOADER ---
// O evento 'load' espera que toda a página, incluindo imagens e outros recursos, seja carregada.
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Adiciona a classe 'hidden' para iniciar a animação de fade-out
        preloader.classList.add('hidden');
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
    const modal = document.getElementById('portfolio-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModal = document.querySelector('.close-button');
    const slides = document.querySelectorAll('.swiper-slide');

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

});
