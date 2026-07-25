/*
Autor: Jimi.7z
Data de criação: 20/07/2026
Versão: 1.0

Versão: 2.0 - Data: 24/07/2026
    - Separação da sidebar

*/
(function() {
    var path = window.location.pathname;
    var isLangPage = path.includes('/br/') || path.includes('/en/');

    // Redirecionamento automático (apenas se NÃO estiver em uma página de idioma)
    if (!isLangPage) {
        var userLang = navigator.language || navigator.languages[0] || 'en';
        var targetPath = userLang.toLowerCase().startsWith('pt') ? '/qscience/br/' : '/qscience/en/';
        var countdownEl = document.getElementById('countdown');
        var seconds = 3;

        var interval = setInterval(function() {
            seconds--;
            if (countdownEl) {
                countdownEl.textContent = 'Redirecionando em ' + seconds + ' segundos...';
            }
            if (seconds <= 0) {
                clearInterval(interval);
                window.location.href = targetPath;
            }
        }, 1000);

        // Cancela o redirecionamento se o usuário clicar em algum link do dropdown
        document.querySelectorAll('.lang-dropdown-menu a').forEach(function(link) {
            link.addEventListener('click', function() {
                clearInterval(interval);
            });
        });
    }

    // --- Inicialização do dropdown (sempre executada) ---
    var btn = document.getElementById('langDropdownBtn');
    var menu = document.getElementById('langDropdownMenu');

    if (btn && menu) {
        // Alterna o dropdown ao clicar no botão
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('show');
            // Gira a setinha, se existir
            var arrow = this.querySelector('.arrow');
            if (arrow) arrow.classList.toggle('open');
        });

        // Fecha o dropdown ao clicar fora
        document.addEventListener('click', function() {
            menu.classList.remove('show');
            var arrow = btn.querySelector('.arrow');
            if (arrow) arrow.classList.remove('open');
        });

        // --- Tratamento dos cliques nos itens do dropdown ---
        var links = menu.querySelectorAll('a');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                // Verifica se é o idioma ativo (classe 'active-lang')
                if (link.classList.contains('active-lang')) {
                    e.preventDefault();        // não navega
                    menu.classList.remove('show'); // fecha o menu
                    var arrow = btn.querySelector('.arrow');
                    if (arrow) arrow.classList.remove('open');
                    return;
                }

                // Opcional: também pode comparar o href com a URL atual
                var href = link.getAttribute('href');
                if (href === window.location.pathname || href === window.location.href) {
                    e.preventDefault();
                    menu.classList.remove('show');
                    return;
                }

                // Para os outros idiomas, permite a navegação normalmente
                // (o menu será fechado pelo redirecionamento ou pelo clique fora)
            });
        });
    }
})();