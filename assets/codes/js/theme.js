/*
Criado em: 25/07/2026
Autor: Jimi
Código: Automação da troca de modo claro-escuro; Botão "voltar ao topo"
Última atualização: 06/08/2026
Versão: 4.0 – Controle genérico de imagens via data-*
*/


/*
  Troca de modo Claro-escuro
*/
(function() {
  'use strict';

  // --- Elementos principais ---
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // --- Função central: aplica o tema a TODAS as imagens marcadas ---
  function applyTheme(isDark) {
    // Seleciona qualquer <img> que possua ambos os atributos
    const images = document.querySelectorAll('img[data-light-src][data-dark-src]');
    images.forEach(img => {
      const newSrc = isDark ? img.getAttribute('data-dark-src')
                            : img.getAttribute('data-light-src');
      if (newSrc) {
        img.src = newSrc;
      }
    });
  }

  // --- Gerenciamento de preferência ---
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let isDark = false;
  if (saved === 'dark') {
    isDark = true;
  } else if (saved === 'light') {
    isDark = false;
  } else {
    isDark = prefersDark; // fallback para preferência do sistema
  }

  // --- Aplica o estado inicial ---
  document.body.classList.toggle('dark-mode', isDark);
  applyTheme(isDark);

  // --- Evento de clique no botão ---
  toggle.addEventListener('click', function() {
    const nowDark = document.body.classList.toggle('dark-mode');
    applyTheme(nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  });

  // --- (Opcional) Escuta mudanças no sistema, mas só se não houver preferência salva ---
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (localStorage.getItem('theme') === null) {
      const systemDark = e.matches;
      document.body.classList.toggle('dark-mode', systemDark);
      applyTheme(systemDark);
    }
  });
})();

/*
  Botão "voltar ao topo"
*/

(function(){
  const btn = document.getElementById('topbtn');
  let timeoutId = null;
  let emRoll = false;

  function VerifyEndPage(){
    // Posição atual do scroll
    const scrollY = window.scrollY || window.pageYOffset;
    // Altura total da página
    const hPage = document.documentElement.scrollHeight;
    // Altura da janela visível
    const hJanela = window.innerHeight;

    // 🔥 DETECÇÃO MELHORADA:
    // Posição do fundo da tela em relação ao topo da página
    const posicaoFundoTela = scrollY + hJanela;
    // Margem de tolerância (20px antes do fim absoluto)
    const margem = 20;

    function Mbtn(){
      btn.classList.add('visivel');
      // Cancela qualquer timeout pendente para esconder
      if (timeoutId){
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    function Ebtn(){
      // 🔥 Garante que não fiquem timeouts antigos acumulados
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        btn.classList.remove('visivel');
        timeoutId = null;
      }, 200);
    }

    // Se o fundo da tela chegou perto do fundo da página → Mostra
    if (posicaoFundoTela >= hPage - margem){
      Mbtn();
    } else {
      Ebtn();
    }
  }

  // --- Listeners (todos fora da VerifyEndPage para não duplicar) ---

  // Scroll com throttle (controle de fluxo)
  window.addEventListener('scroll', function(){
    if (!emRoll){
      window.requestAnimationFrame(function(){
        VerifyEndPage();
        emRoll = false;
      });
      emRoll = true;
    }
  });

  // Clique no botão → rolagem suave
  btn.addEventListener('click', function(){
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // Verifica ao carregar a página
  window.addEventListener('load', VerifyEndPage);

  // 🔥 NOVO: Verifica se o usuário redimensionar a janela
  // (pois o "fim da página" muda quando a altura da janela muda)
  window.addEventListener('resize', VerifyEndPage);
})();
