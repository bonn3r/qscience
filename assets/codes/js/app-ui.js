/*==========================================================================
Criado em 28/06/2026
Atualizado em 16/10/2026
Autor: Jimi
Coautor: Gemini
Código: app-ui.js - Interface Unificada: Sidebar Dinâmica, Temas, Idiomas,
                   Índice (TOC), Botão ao Topo, Gavetas e Clipboard Original
Projeto: Q-Science
==========================================================================*/

(function() {
  'use strict';

  /* --------------------------------------------------------------------------
   1. UTILITÁRIOS GLOBAIS: ÁREA DE TRANSFERÊNCIA (COMPORTAMENTO ORIGINAL + FALLBACK)
   -------------------------------------------------------------------------- */
  function fallbackCopyText(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  function copyTextToClipboard(text, onSuccess, onError) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function() {
          if (typeof onSuccess === 'function') onSuccess();
        })
        .catch(function() {
          if (fallbackCopyText(text)) {
            if (typeof onSuccess === 'function') onSuccess();
          } else if (typeof onError === 'function') {
            onError();
          }
        });
    } else {
      if (fallbackCopyText(text)) {
        if (typeof onSuccess === 'function') onSuccess();
      } else if (typeof onError === 'function') {
        onError();
      }
    }
  }

  /* --------------------------------------------------------------------------
   2. CARREGAMENTO DINÂMICO DA SIDEBAR (BILÍNGUE)
   -------------------------------------------------------------------------- */
  function initDynamicSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    var currentPath = window.location.pathname;
    var htmlLang = (document.documentElement.lang || '').toLowerCase();
    var isEnglish = currentPath.includes('/en/') || htmlLang.startsWith('en');

    var partialUrl = isEnglish
      ? '/qscience/assets/scr/ensidebar.html'
      : '/qscience/assets/scr/sidebar.html';

    if (window.jQuery) {
      window.jQuery(sidebar).load(partialUrl, function() {
        if (typeof window.initSidebar === 'function') {
          window.initSidebar();
        }

        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
          window.MathJax.typesetPromise([sidebar]).catch(function(err) {
            console.warn('Erro ao renderizar equações com MathJax:', err);
          });
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
   3. GESTÃO DO TEMA (CLARO / ESCURO)
   -------------------------------------------------------------------------- */
  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    function applyTheme(isDark) {
      var images = document.querySelectorAll('img[data-light-src][data-dark-src]');
      images.forEach(function(img) {
        var newSrc = isDark ? img.getAttribute('data-dark-src')
                            : img.getAttribute('data-light-src');
        if (newSrc) {
          img.src = newSrc;
        }
      });
    }

    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' ? true : (saved === 'light' ? false : prefersDark);

    document.body.classList.toggle('dark-mode', isDark);
    applyTheme(isDark);

    toggle.addEventListener('click', function() {
      var nowDark = document.body.classList.toggle('dark-mode');
      applyTheme(nowDark);
      localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (localStorage.getItem('theme') === null) {
        document.body.classList.toggle('dark-mode', e.matches);
        applyTheme(e.matches);
      }
    });
  }

  /* --------------------------------------------------------------------------
   4. DROPDOWN DE IDIOMAS
   -------------------------------------------------------------------------- */
  function initLanguageDropdown() {
    var btn = document.getElementById('langDropdownBtn');
    var menu = document.getElementById('langDropdownMenu');
    var currentPath = window.location.pathname;
    var isLangPage = currentPath.includes('/br/') || currentPath.includes('/en/');

    if (!isLangPage) {
      var userLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
      var targetPath = userLang.toLowerCase().startsWith('pt') ? '/qscience/br/' : '/qscience/en/';
      var countdownEl = document.getElementById('countdown');
      var seconds = 1;

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

      document.querySelectorAll('.lang-dropdown-menu a').forEach(function(link) {
        link.addEventListener('click', function() {
          clearInterval(interval);
        });
      });
    }

    if (btn && menu) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('show');

        var arrow = btn.querySelector('.arrow');
        if (arrow) arrow.classList.toggle('open');

        if (menu.classList.contains('show')) {
          var tocPanel = document.getElementById('toc-panel');
          if (tocPanel) tocPanel.classList.remove('open');
        }
      });

      menu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function(e) {
          if (link.classList.contains('active-lang')) {
            e.preventDefault();
            menu.classList.remove('show');
            var arrow = btn.querySelector('.arrow');
            if (arrow) arrow.classList.remove('open');
            return;
          }

          var href = link.getAttribute('href');
          if (href === window.location.pathname || href === window.location.href) {
            e.preventDefault();
            menu.classList.remove('show');
          }
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
   5. BOTÃO "VOLTAR AO TOPO"
   -------------------------------------------------------------------------- */
  function initScrollTopButton() {
    var btn = document.getElementById('topbtn');
    if (!btn) return;

    var timeoutId = null;
    var isScrolling = false;

    function verifyEndPage() {
      var scrollY = window.scrollY || window.pageYOffset;
      var hPage = document.documentElement.scrollHeight;
      var hJanela = window.innerHeight;

      if (hPage <= hJanela) {
        btn.classList.remove('visivel');
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        return;
      }

      var posicaoFundoTela = scrollY + hJanela;
      var margem = 20;

      if (posicaoFundoTela >= hPage - margem) {
        btn.classList.add('visivel');
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
          btn.classList.remove('visivel');
          timeoutId = null;
        }, 200);
      }
    }

    window.addEventListener('scroll', function() {
      if (!isScrolling) {
        window.requestAnimationFrame(function() {
          verifyEndPage();
          isScrolling = false;
        });
        isScrolling = true;
      }
    });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('load', verifyEndPage);
    window.addEventListener('resize', verifyEndPage);
  }

  /* --------------------------------------------------------------------------
   6. ÍNDICE LATERAL (TOC)
   -------------------------------------------------------------------------- */
  function initTableOfContents() {
    var toggleBtn = document.getElementById('toc-toggle');
    var panel = document.getElementById('toc-panel');

    if (toggleBtn && panel) {
      toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpening = !panel.classList.contains('open');
        panel.classList.toggle('open');

        if (isOpening) {
          var langMenu = document.getElementById('langDropdownMenu');
          if (langMenu) langMenu.classList.remove('show');
        }
      });

      panel.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          panel.classList.remove('open');
        });
      });
    }

    if (panel) {
      var sections = document.querySelectorAll('section[id], div[id]');
      var navLinks = panel.querySelectorAll('a');

      function updateActiveLink() {
        var currentId = '';
        sections.forEach(function(section) {
          var rect = section.getBoundingClientRect();
          if (rect.top <= 120) {
            currentId = section.getAttribute('id');
          }
        });

        navLinks.forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + currentId) {
            link.classList.add('active');
            link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        });
      }

      var ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            updateActiveLink();
            ticking = false;
          });
          ticking = true;
        }
      });
      updateActiveLink();
    }
  }

  /* --------------------------------------------------------------------------
   7. GAVETAS RETRÁTEIS (.drawer) E COPIAR BIBTEX (COM SUPORTE GLOBAL)
   -------------------------------------------------------------------------- */
  function copyBibtexFromDrawer(drawer) {
    if (!drawer) return;
    var codeElement = drawer.querySelector('.bibtex-content');
    if (!codeElement) {
      console.warn('Elemento .bibtex-content não encontrado em', drawer.id);
      return;
    }

    var text = codeElement.textContent.trim();
    var btn = drawer.querySelector('.drawer-copy');
    var isEnglish = window.location.pathname.includes('/en/') || (document.documentElement.lang || '').toLowerCase().startsWith('en');

    copyTextToClipboard(text, function() {
      if (btn) {
        var original = btn.getAttribute('data-original-text') || btn.textContent;
        btn.setAttribute('data-original-text', original);
        btn.textContent = isEnglish ? 'Copied!' : 'Copiado!';
        setTimeout(function() {
          btn.textContent = original;
        }, 2000);
      }
    }, function() {
      alert(isEnglish ? 'Could not copy. Please copy manually.' : 'Não foi possível copiar. Tente manualmente.');
    });
  }

  // Expõe funções globalmente caso algum HTML chame onclick="copyBibtex('...')"
  window.copyBibtex = function(drawerId) {
    var drawer = document.getElementById(drawerId);
    copyBibtexFromDrawer(drawer);
  };

  function initDrawers() {
    document.addEventListener('click', function(e) {
      var toggleBtn = e.target.closest('.drawer-toggle');
      if (toggleBtn) {
        e.preventDefault();
        var target = toggleBtn.getAttribute('data-target');
        if (!target) return;
        var drawer = document.getElementById('drawer-' + target);
        if (drawer) drawer.classList.toggle('open');
        return;
      }

      var closeBtn = e.target.closest('.drawer-close');
      if (closeBtn) {
        e.preventDefault();
        var closeTarget = closeBtn.getAttribute('data-target');
        if (closeTarget) {
          var drawerToClose = document.getElementById('drawer-' + closeTarget);
          if (drawerToClose) drawerToClose.classList.remove('open');
        } else {
          var parentDrawer = closeBtn.closest('.drawer');
          if (parentDrawer) parentDrawer.classList.remove('open');
        }
        return;
      }

      var copyBtn = e.target.closest('.drawer-copy');
      if (copyBtn) {
        e.preventDefault();
        var targetAttr = copyBtn.getAttribute('data-target');
        var drawerEl = targetAttr ? document.getElementById('drawer-' + targetAttr) : copyBtn.closest('.drawer');
        copyBibtexFromDrawer(drawerEl);
      }
    });
  }

  /* --------------------------------------------------------------------------
   8. COPIAR E-MAIL COM FEEDBACK VISUAL (COMPORTAMENTO EXATO DO SITE ORIGINAL)
   -------------------------------------------------------------------------- */
  function initEmailClipboard() {
    var email = 'willianbonnermelo@gmail.com';
    var timeout = null;

    // Usa `true` (fase de captura) para não ser bloqueado pelo stopPropagation() da #sidebar no main.js
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('#emailIcon, #btnCopyEmail, .btn-copy-email');
      if (!trigger) return;

      e.preventDefault();
      e.stopPropagation();

      var icon = trigger.tagName.toLowerCase() === 'img'
        ? trigger
        : (trigger.querySelector('img') || document.getElementById('emailIcon'));

      var feedback = document.getElementById('feedbackCopiar') ||
                     (trigger.parentElement && trigger.parentElement.querySelector('.copy-feedback'));

      if (!feedback) return;

      if (timeout) clearTimeout(timeout);

      var isEnglish = window.location.pathname.includes('/en/') || (document.documentElement.lang || '').toLowerCase().startsWith('en');

      copyTextToClipboard(email, function() {
        // Feedback de sucesso idêntico ao sidebar.js / ensidebar.js original
        if (icon) {
          icon.style.filter = 'brightness(0) saturate(100%) invert(40%) sepia(100%) saturate(1000%) hue-rotate(90deg) brightness(100%) contrast(120%)';
        }
        feedback.textContent = isEnglish ? 'Copy!' : 'Copiado!';
        feedback.style.color = '#0d7a3e';
        feedback.style.display = 'block';
        feedback.style.opacity = '1';
        feedback.style.visibility = 'visible';

        timeout = setTimeout(function() {
          if (icon) icon.style.filter = '';
          feedback.style.opacity = '0';
          setTimeout(function() {
            feedback.style.display = 'none';
          }, 200);
        }, 3000);
      }, function() {
        // Feedback de erro idêntico ao sidebar.js / ensidebar.js original
        if (icon) {
          icon.style.filter = 'brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(5000%) hue-rotate(0deg) brightness(80%) contrast(110%)';
        }
        feedback.textContent = isEnglish ? 'Error!' : 'Erro!';
        feedback.style.color = '#b00020';
        feedback.style.display = 'block';
        feedback.style.opacity = '1';
        feedback.style.visibility = 'visible';

        timeout = setTimeout(function() {
          if (icon) icon.style.filter = '';
          feedback.style.opacity = '0';
          setTimeout(function() {
            feedback.style.display = 'none';
          }, 200);
        }, 3000);
      });
    }, true);
  }

  /* --------------------------------------------------------------------------
   9. GESTOR CENTRALIZADO DE FECHO EXTERIOR (CLICK-OUTSIDE)
   -------------------------------------------------------------------------- */
  function initGlobalClickOutside() {
    document.addEventListener('click', function(event) {
      // 1. Menu de idiomas
      if (!event.target.closest('#langDropdown')) {
        var langMenu = document.getElementById('langDropdownMenu');
        if (langMenu) langMenu.classList.remove('show');
        var langBtn = document.getElementById('langDropdownBtn');
        if (langBtn) {
          var arrow = langBtn.querySelector('.arrow');
          if (arrow) arrow.classList.remove('open');
        }
      }

      // 2. Painel de Índice (TOC)
      var tocPanel = document.getElementById('toc-panel');
      var tocToggle = document.getElementById('toc-toggle');
      if (tocPanel && tocToggle && !tocPanel.contains(event.target) && !tocToggle.contains(event.target)) {
        tocPanel.classList.remove('open');
      }

      // 3. Gavetas retráteis
      if (!event.target.closest('.drawer-toggle') && !event.target.closest('.drawer.open')) {
        document.querySelectorAll('.drawer.open').forEach(function(drawer) {
          drawer.classList.remove('open');
        });
      }
    });
  }

  /* --------------------------------------------------------------------------
   10. INICIALIZAÇÃO GERAL DO DOM
   -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function() {
    initDynamicSidebar();
    initThemeToggle();
    initLanguageDropdown();
    initScrollTopButton();
    initTableOfContents();
    initDrawers();
    initEmailClipboard();
    initGlobalClickOutside();
  });

})();