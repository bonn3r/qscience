/*
  rightbar.js – Barra lateral direita unificada
  Versão: 2.0 – Adaptado para CSS Grid (layout definitivo)
  Inclui: Tema (claro/escuro), idioma (dropdown), botão voltar ao topo, índice
  Autor: Jimi
  Última atualização: 10/08/2026
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
    let seconds = 1; // ajuste conforme necessário

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

      // Fecha o painel de índice se o idioma for aberto
      if (menu.classList.contains('show')) {
        const tocPanel = document.getElementById('toc-panel');
        if (tocPanel) tocPanel.classList.remove('open');
      }
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
// 3. BOTÃO "VOLTAR AO TOPO"
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

    // Se a página NÃO tem rolagem, esconde o botão
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


// ============================================================
// 4. ÍNDICE (TOC) – Painel e navegação
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toc-toggle');
  const panel = document.getElementById('toc-panel');

  // ----- Controle do painel de índice -----
  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpening = !panel.classList.contains('open');
      panel.classList.toggle('open');
      // Fecha o menu de idiomas se o índice for aberto
      if (isOpening) {
        const langMenu = document.getElementById('langDropdownMenu');
        if (langMenu) langMenu.classList.remove('show');
      }
    });

    // Fechar ao clicar em um link
    panel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        panel.classList.remove('open');
      });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
        panel.classList.remove('open');
      }
    });
  }

  // ----- Destaque automático do item ativo (scroll) -----
  if (panel) {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = panel.querySelectorAll('a');

    function updateActiveLink() {
      let currentId = '';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120) {
          currentId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('active');
          link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
    }

    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });
    updateActiveLink(); // inicial
  }
});

// ============================================================
// 5. ALTERNÂNCIA ENTRE LISTA E GRADE NAS PÁGINAS
// ============================================================

/**
 * Sistema de alternância entre visualização LISTA e GRADE
 * com persistência no localStorage e animação suave do seletor.
 */
document.addEventListener('DOMContentLoaded', function() {

    // ----- Elementos do DOM -----
    const container = document.querySelector('.posts-container');
    const toggleSlider = document.getElementById('viewToggle');
    const labels = toggleSlider.querySelectorAll('.toggle-label');
    const STORAGE_KEY = 'qscience_view_mode';

    // Se o container não existir, interrompe a execução (evita erros)
    if (!container || !toggleSlider) {
        console.warn('Elementos .posts-container ou #viewToggle não encontrados.');
        return;
    }

    /**
     * Função principal que aplica o modo de visualização.
     * @param {string} mode - 'list' ou 'grid'
     */
    function setViewMode(mode) {
        // 1. Atualiza a classe do container de posts
        container.classList.remove('list-view', 'grid-view');
        container.classList.add(mode + '-view');

        // 2. Atualiza a classe do seletor para mover o indicador
        toggleSlider.classList.remove('list-active', 'grid-active');
        toggleSlider.classList.add(mode + '-active');

        // 3. Atualiza a classe 'active' nos textos (labels)
        labels.forEach(label => {
            label.classList.remove('active');
            if (label.dataset.view === mode) {
                label.classList.add('active');
            }
        });

        // 4. Salva a preferência no localStorage do navegador
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (e) {
            // Ignora erros de storage (ex: modo privado)
        }
    }

    // ----- Restaura a preferência salva (ou define 'list' como padrão) -----
    let savedMode = 'list';
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'list' || stored === 'grid') {
            savedMode = stored;
        }
    } catch (e) {
        // Ignora erros de storage
    }
    setViewMode(savedMode);

    // ----- Adiciona eventos de clique em cada opção (Lista / Grade) -----
    labels.forEach(label => {
        label.addEventListener('click', function(e) {
            const mode = this.dataset.view;
            // Se a opção clicada já estiver ativa, não faz nada
            if (this.classList.contains('active')) return;
            setViewMode(mode);
        });
    });

});