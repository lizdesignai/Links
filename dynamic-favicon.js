// Studio Veronna - Dynamic Favicon Handler
(function() {
    function updateFavicon() {
        try {
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            // Se tema escuro: Ativo 2.svg (Off-white / Linen)
            // Se tema claro: Ativo 5.svg (Burgundy)
            const iconPath = isDark ? 'img/Ativo 2.svg' : 'img/Ativo 5.svg';

            let link = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.type = 'image/svg+xml';
            link.href = iconPath;
        } catch (e) {
            console.warn('Favicon update error:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateFavicon);
    } else {
        updateFavicon();
    }

    if (window.matchMedia) {
        try {
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            if (mql.addEventListener) {
                mql.addEventListener('change', updateFavicon);
            } else if (mql.addListener) {
                mql.addListener(updateFavicon);
            }
        } catch (err) {}
    }
})();
