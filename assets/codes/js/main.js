/*==========================================================================
Criado em 28/06/2026
Atualizado em 06/10/2026
Autor: Jimi
Coautor: Gemini
Código: main.js - Núcleo de Layout, Responsividade e Comportamento da Barra Lateral
Projeto: Q-Science
==========================================================================*/

(function($) {
  'use strict';

  var $window = $(window),
      $head = $('head'),
      $body = $('body');

  /* --------------------------------------------------------------------------
   1. DEFINIÇÃO DE BREAKPOINTS RESPONSIVOS
   -------------------------------------------------------------------------- */
  breakpoints({
    k4:                [ '4096px',  '2160px' ],
    xlarge:            [ '1281px',  '1680px' ],
    large:             [ '981px',   '1280px' ],
    medium:            [ '737px',   '980px'  ],
    small:             [ '481px',   '736px'  ],
    xsmall:            [ '361px',   '480px'  ],
    xxsmall:           [ null,      '360px'  ],
    'xlarge-to-max':   '(min-width: 1681px)',
    'small-to-xlarge': '(min-width: 481px) and (max-width: 1680px)'
  });

  /* --------------------------------------------------------------------------
   2. CONTROLE DE ANIMAÇÕES NO CARREGAMENTO E REDIMENSIONAMENTO
   -------------------------------------------------------------------------- */
  $window.on('load', function() {
    window.setTimeout(function() {
      $body.removeClass('is-preload');
    }, 100);
  });

  var resizeTimeout;
  $window.on('resize', function() {
    $body.addClass('is-resizing');
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      $body.removeClass('is-resizing');
    }, 100);
  });

  /* --------------------------------------------------------------------------
   3. FUNÇÕES AUXILIARES DE NAVEGAÇÃO
   -------------------------------------------------------------------------- */
  function closeAllSubmenus() {
    $('#sidebar .opener').removeClass('active');
  }

  function highlightCurrentMenuItem() {
    var currentPath = window.location.pathname.replace(/\/$/, '');

    $('#menu .active-link, #menu .active-menu-item, #menu .active-parent')
      .removeClass('active-link active-menu-item active-parent');

    closeAllSubmenus();

    $('#menu a').each(function() {
      var link = $(this),
          href = link.attr('href');

      if (!href || href === '#' || href === '') return;

      var tempAnchor = document.createElement('a');
      tempAnchor.href = href;
      var linkClean = tempAnchor.pathname.replace(/\/$/, '');

      if (linkClean === currentPath) {
        link.addClass('active-link');
        var li = link.closest('li');
        li.addClass('active-menu-item');

        var parentLi = li.parent().closest('li');
        if (parentLi.length) {
          parentLi.addClass('active-parent');
          var opener = parentLi.children('.opener');
          if (opener.length) {
            opener.addClass('active');
          }
        }

        if (link.hasClass('opener')) {
          link.addClass('active');
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
   4. INICIALIZAÇÃO E CONTROLE DA BARRA LATERAL (SIDEBAR)
   -------------------------------------------------------------------------- */
  window.initSidebar = function() {
    var $sidebar = $('#sidebar');
    if (!$sidebar.length || !$sidebar.children('.inner').length) {
      return;
    }

    // Evita vincular múltiplos listeners se executado mais de uma vez
    if ($sidebar.data('sidebar-initialized')) {
      highlightCurrentMenuItem();
      return;
    }
    $sidebar.data('sidebar-initialized', true);

    var $sidebar_inner = $sidebar.children('.inner'),
        $wrapper = $('#wrapper');

    function syncWrapperWithSidebar() {
      if ($sidebar.hasClass('inactive')) {
        $wrapper.addClass('menu-closed');
      } else {
        $wrapper.removeClass('menu-closed');
      }
    }

    // Suporte a navegadores sem object-fit
    if (!browser.canUse('object-fit') || browser.name === 'safari') {
      $('.image.object').each(function() {
        var $this = $(this),
            $img = $this.children('img');

        $img.css('opacity', '0');
        $this
          .css('background-image', 'url("' + $img.attr('src') + '")')
          .css('background-size', $img.css('object-fit') ? $img.css('object-fit') : 'cover')
          .css('background-position', $img.css('object-position') ? $img.css('object-position') : 'center');
      });
    }

    // Configuração de estado por breakpoint
    breakpoints.on('<=k4', function() {
      $sidebar.addClass('inactive');
      syncWrapperWithSidebar();
      closeAllSubmenus();
    });

    breakpoints.on('>k4', function() {
      $sidebar.removeClass('inactive');
      syncWrapperWithSidebar();
    });

    // Ajuste específico para navegadores Android/Chrome
    if (browser.os === 'android' && browser.name === 'chrome') {
      $('<style>#sidebar .inner::-webkit-scrollbar { display: none; }</style>').appendTo($head);
    }

    // Botão de alternância (Toggle)
    $('<a href="#sidebar" class="toggle">Toggle</a>')
      .appendTo($sidebar)
      .on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $sidebar.toggleClass('inactive');
        syncWrapperWithSidebar();
        if ($sidebar.hasClass('inactive')) {
          closeAllSubmenus();
        }
      });

    // Navegação via links da barra lateral
    $sidebar.on('click', 'a', function(event) {
      if (breakpoints.active('>k4')) return;

      var $a = $(this),
          href = $a.attr('href'),
          target = $a.attr('target');

      event.preventDefault();
      event.stopPropagation();

      if (!href || href === '#' || href === '') return;

      $sidebar.addClass('inactive');
      syncWrapperWithSidebar();
      closeAllSubmenus();

      setTimeout(function() {
        if (target === '_blank') {
          window.open(href);
        } else {
          window.location.href = href;
        }
      }, 500);
    });

    // Previne borbulhamento de eventos de toque no elemento da sidebar
    $sidebar.on('click touchend touchstart touchmove', function(event) {
      if (breakpoints.active('>k4')) return;
      event.stopPropagation();
    });

    // Clique fora fecha a barra lateral em telas menores
    $body.on('click touchend', function() {
      if (breakpoints.active('>k4')) return;
      $sidebar.addClass('inactive');
      syncWrapperWithSidebar();
      closeAllSubmenus();
    });

    // Bloqueio de posição durante rolagem (Scroll Lock)
    var sh, wh, st;
    if ($window.scrollTop() === 1) {
      $window.scrollTop(0);
    }

    $window
      .on('scroll.sidebar-lock', function() {
        if (breakpoints.active('<=k4')) {
          $sidebar_inner
            .data('locked', 0)
            .css('position', '')
            .css('top', '');
          return;
        }

        var x = Math.max(sh - wh, 0);
        var y = Math.max(0, $window.scrollTop() - x);

        if ($sidebar_inner.data('locked') === 1) {
          if (y <= 0) {
            $sidebar_inner
              .data('locked', 0)
              .css('position', '')
              .css('top', '');
          } else {
            $sidebar_inner.css('top', -1 * x);
          }
        } else {
          if (y > 0) {
            $sidebar_inner
              .data('locked', 1)
              .css('position', 'fixed')
              .css('top', -1 * x);
          }
        }
      })
      .on('resize.sidebar-lock', function() {
        wh = $window.height();
        sh = $sidebar_inner.outerHeight() + 30;
        $window.trigger('scroll.sidebar-lock');
      })
      .trigger('resize.sidebar-lock');

    // Menu expansível com subitens (Opener)
    var $menu = $('#menu');
    $menu.find('.opener').on('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      var $this = $(this);
      $this.toggleClass('active');
      $this.closest('li').siblings('li').find('.opener').removeClass('active');
      $window.triggerHandler('resize.sidebar-lock');
    });

    // Atualiza marcação do link ativo
    highlightCurrentMenuItem();

    // Notifica que a interface da barra lateral foi inicializada
    $(document).trigger('sidebar:initialized');
  };

  /* --------------------------------------------------------------------------
   5. EXECUÇÃO INICIAL
   -------------------------------------------------------------------------- */
  $(document).ready(function() {
    // Inicializa imediatamente se a sidebar já tiver seu conteúdo injetado estaticamente
    if ($('#sidebar .inner').length) {
      window.initSidebar();
    }
  });

})(jQuery);