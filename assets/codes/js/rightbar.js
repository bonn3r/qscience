/*
  rightbar.js – Barra lateral direita unificada
  Versão: 1.0
  Inclui: Tema (claro/escuro), idioma (dropdown), botão voltar ao topo
  Autor: Jimi
  Última atualização: 06/08/2026
*/

// ============================================================
// 1. TROCA DE TEMA (claro/escuro)
// ============================================================
(function() {
  'use strict';

  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function applyTheme(isDark) {
    const images = document.querySelectorAll('img[data-light-src][data-dark-src]');
    images.forEach(img => {
      const newSrc = isDark ? img.getAttribute('data-dark-src')
                            : img.getAttribute('data-light-src');
      if (newSrc) {
        img.src = newSrc;
      }
    });
  }

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let isDark = false;
  if (saved === 'dark') {
    isDark = true;
  } else if (saved === 'light') {
    isDark = false;
  } else {
    isDark = prefersDark;
  }

  document.body.classList.toggle('dark-mode', isDark);
  applyTheme(isDark);

  toggle.addEventListener('click', function() {
    const nowDark = document.body.classList.toggle('dark-mode');
    applyTheme(nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (localStorage.getItem('theme') === null) {
      const systemDark = e.matches;
      document.body.classList.toggle('dark-mode', systemDark);
      applyTheme(systemDark);
    }
  });
})();


// ============================================================
// 2. DROPDOWN DE IDIOMAS + REDIRECIONAMENTO AUTOMÁTICO
// ============================================================
(function() {
  'use strict';

  const path = window.location.pathname;
  const isLangPage = path.includes('/br/') || path.includes('/en/');

  // --- Redirecionamento automático (apenas se NÃO estiver numa página de idioma) ---
  if (!isLangPage) {
    const userLang = navigator.language || navigator.languages[0] || 'en';
    const targetPath = userLang.toLowerCase().startsWith('pt') ? '/qscience/br/' : '/qscience/en/';
    const countdownEl = document.getElementById('countdown');
    /*let seconds = 1;*/

    const interval = setInterval(function() {
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

  // --- Inicialização do dropdown ---
  const btn = document.getElementById('langDropdownBtn');
  const menu = document.getElementById('langDropdownMenu');

  if (btn && menu) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      menu.classList.toggle('show');
      const arrow = this.querySelector('.arrow');
      if (arrow) arrow.classList.toggle('open');
    });

    document.addEventListener('click', function() {
      menu.classList.remove('show');
      const arrow = btn.querySelector('.arrow');
      if (arrow) arrow.classList.remove('open');
    });

    const links = menu.querySelectorAll('a');
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        if (link.classList.contains('active-lang')) {
          e.preventDefault();
          menu.classList.remove('show');
          const arrow = btn.querySelector('.arrow');
          if (arrow) arrow.classList.remove('open');
          return;
        }

        const href = link.getAttribute('href');
        if (href === window.location.pathname || href === window.location.href) {
          e.preventDefault();
          menu.classList.remove('show');
          return;
        }
        // Para outros idiomas, permite a navegação normal
      });
    });
  }
})();


// ============================================================
// 3. BOTÃO "VOLTAR AO TOPO" – ATUALIZADO
// ============================================================
(function() {
  'use strict';

  const btn = document.getElementById('topbtn');
  if (!btn) return;

  let timeoutId = null;
  let emRoll = false;

  function verifyEndPage() {
    const scrollY = window.scrollY || window.pageYOffset;
    const hPage = document.documentElement.scrollHeight;
    const hJanela = window.innerHeight;

    // ============================================================
    // 🔥 CORREÇÃO: Se a página NÃO tem rolagem, esconde o botão
    // e interrompe a execução imediatamente.
    // ============================================================
    if (hPage <= hJanela) {
      btn.classList.remove('visivel');
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return;
    }

    const posicaoFundoTela = scrollY + hJanela;
    const margem = 20;

    function showBtn() {
      btn.classList.add('visivel');
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    function hideBtn() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        btn.classList.remove('visivel');
        timeoutId = null;
      }, 200);
    }

    if (posicaoFundoTela >= hPage - margem) {
      showBtn();
    } else {
      hideBtn();
    }
  }

  window.addEventListener('scroll', function() {
    if (!emRoll) {
      window.requestAnimationFrame(function() {
        verifyEndPage();
        emRoll = false;
      });
      emRoll = true;
    }
  });

  btn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  window.addEventListener('load', verifyEndPage);
  window.addEventListener('resize', verifyEndPage);
})();