$(function() {
    // Carrega o conteúdo da sidebar a partir do arquivo partial
    $('#sidebar').load('/qscience/br/sidebar.html', function() {
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