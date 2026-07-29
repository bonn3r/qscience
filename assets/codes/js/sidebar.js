/*
Criado em: 28/07/2026
Editor: Jimi
Código: Javascritp que chama a barra lateral para o site + scrip que copia email.
Versão: 1.0
*/

$(function() {
    // Carrega o conteúdo da sidebar a partir do arquivo partial
    $('#sidebar').load('/qscience/assets/scr/sidebar.html', function() {
        // Após carregar, executa a inicialização do main.js
        // (supondo que main.js define uma função init que pode ser chamada)

        if (typeof window.initSidebar === 'function') {
            window.initSidebar();
                if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
                MathJax.typesetPromise().catch(function(err) {
                console.warn('Erro ao renderizar equações com MathJax:', err);
            });}
        } 
        else {
        // Se não tiver uma função explícita, podemos simplesmente
        // disparar um evento para que o main.js reaja, ou reexecutar
        // o código do main.js.
        // Uma solução é mover o código do main.js para uma função
        // e chamá-la aqui.
      }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const email = 'willianbonnermelo@gmail.com';
    let timeout = null;

    // Escuta cliques em todo o documento e verifica se o alvo é o ícone de e-mail
    document.addEventListener('click', function(e) {
        const icon = e.target.closest('#emailIcon');
        if (!icon) return; // clique não foi no ícone

        e.preventDefault();

        const feedback = document.getElementById('feedbackCopiar');
        if (!feedback) return;

        if (timeout) clearTimeout(timeout);

        navigator.clipboard.writeText(email)
            .then(() => {
                // Feedback de sucesso (verde)
                icon.style.filter = 'brightness(0) saturate(100%) invert(40%) sepia(100%) saturate(1000%) hue-rotate(90deg) brightness(100%) contrast(120%)';
                feedback.textContent = 'Copiado!';
                feedback.style.color = '#0d7a3e';
                feedback.style.display = 'block';
                feedback.style.opacity = '1';

                timeout = setTimeout(() => {
                    icon.style.filter = '';
                    feedback.style.opacity = '0';
                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 200);
                }, 3000);
            })
            .catch(() => {
                // Feedback de erro (vermelho)
                icon.style.filter = 'brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(5000%) hue-rotate(0deg) brightness(80%) contrast(110%)';
                feedback.textContent = 'Erro!';
                feedback.style.color = '#b00020';
                feedback.style.display = 'block';
                feedback.style.opacity = '1';

                timeout = setTimeout(() => {
                    icon.style.filter = '';
                    feedback.style.opacity = '0';
                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 200);
                }, 3000);
            });
    });
});