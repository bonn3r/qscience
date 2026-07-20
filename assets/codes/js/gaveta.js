// ========== Controle das Gavetas ==========
document.addEventListener('DOMContentLoaded', function() {

    // Alterna abertura/fechamento da gaveta
    function toggleDrawer(drawerId) {
        const drawer = document.getElementById(drawerId);
        if (!drawer) return;
        drawer.classList.toggle('open');
    }

    // Fecha uma gaveta específica
    function closeDrawer(drawerId) {
        const drawer = document.getElementById(drawerId);
        if (drawer) drawer.classList.remove('open');
    }

    // Copia o conteúdo do BibTeX para a área de transferência
    function copyBibtex(drawerId) {
        const drawer = document.getElementById(drawerId);
        if (!drawer) return;
        // Busca o elemento com a classe "bibtex-content" dentro da gaveta
        const codeElement = drawer.querySelector('.bibtex-content');
        if (!codeElement) {
            console.warn('Elemento .bibtex-content não encontrado em', drawerId);
            return;
        }
        const text = codeElement.textContent.trim();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    // Feedback visual
                    const btn = drawer.querySelector('.drawer-copy');
                    if (btn) {
                        const original = btn.textContent;
                        btn.textContent = 'Copiado!';
                        setTimeout(() => { btn.textContent = original; }, 2000);
                    }
                })
                .catch(err => {
                    console.error('Falha ao copiar: ', err);
                    alert('Não foi possível copiar. Tente manualmente.');
                });
        } else {
            // Fallback para navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                alert('Copiado!');
            } catch (e) {
                alert('Falha ao copiar. Copie manualmente.');
            }
            document.body.removeChild(textarea);
        }
    }

    // --- Eventos ---

    // Botões "Resumo" e "LaTex" (abrem/fecham)
    document.querySelectorAll('.drawer-toggle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (!target) return;
            const drawerId = 'drawer-' + target;
            toggleDrawer(drawerId);
        });
    });

    // Botões "Fechar" dentro das gavetas
    document.querySelectorAll('.drawer-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (!target) return;
            const drawerId = 'drawer-' + target;
            closeDrawer(drawerId);
        });
    });

    // Botões "Copiar" dentro da gaveta BibTeX
    document.querySelectorAll('.drawer-copy').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (!target) return;
            const drawerId = 'drawer-' + target;
            copyBibtex(drawerId);
        });
    });
});