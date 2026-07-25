
(function($) {

	var $window = $(window),
		$head = $('head'),
		$body = $('body');

	// Breakpoints
	breakpoints({
		k4:   [ '4096px',  '2160px' ],
		xlarge:   [ '1281px',  '1680px' ],
		large:    [ '981px',   '1280px' ],
		medium:   [ '737px',   '980px'  ],
		small:    [ '481px',   '736px'  ],
		xsmall:   [ '361px',   '480px'  ],
		xxsmall:  [ null,      '360px'  ],
		'xlarge-to-max':    '(min-width: 1681px)',
		'small-to-xlarge':  '(min-width: 481px) and (max-width: 1680px)'
	});

	// Stops animations/transitions
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

	// ---------- FUNÇÕES AUXILIARES ----------

	// Fecha todos os submenus (remove a classe 'active' dos .opener)
	function closeAllSubmenus() {
		$('#sidebar .opener').removeClass('active');
		// O CSS já trata .opener.active + ul como display:block; ao remover a classe, o submenu some
	}

	// Destaca o item de menu correspondente à URL atual
	function highlightCurrentMenuItem() {
		var currentPath = window.location.pathname;
		// Remove qualquer destaque anterior
		$('#menu .active-link, #menu .active-menu-item, #menu .active-parent').removeClass('active-link active-menu-item active-parent');
		// Fecha todos os submenus antes de reabrir o necessário (evita conflitos)
		closeAllSubmenus();

		$('#menu a').each(function() {
			var link = $(this);
			var href = link.attr('href');
			if (!href || href === '#' || href === '') return;

			// Obtém o caminho absoluto do link (considera URLs relativas e absolutas)
			var a = document.createElement('a');
			a.href = href;
			var linkPath = a.pathname;

			// Comparação: remove barras finais para evitar falsos negativos
			var current = currentPath.replace(/\/$/, '');
			var linkClean = linkPath.replace(/\/$/, '');

			if (linkClean === current) {
				// Adiciona classe ao próprio link
				link.addClass('active-link');
				// Adiciona classe ao <li> pai imediato
				var li = link.closest('li');
				li.addClass('active-menu-item');

				// Se este <li> estiver dentro de um submenu, ativa o .opener do submenu pai
				var parentLi = li.parent().closest('li');
				if (parentLi.length) {
					parentLi.addClass('active-parent');
					var opener = parentLi.children('.opener');
					if (opener.length) {
						opener.addClass('active'); // abre o submenu
					}
				}
				// Também pode ser necessário ativar o opener do próprio item se ele for um submenu pai? Mas isso já está coberto pelo active-parent.
				// Se o próprio item for um .opener (tem submenu), ele será ativado se for o pai do link ativo.
				// Caso o item ativo seja o próprio opener (ex: página de "Pesquisa" e o link é o opener), vamos ativá-lo também.
				if (link.hasClass('opener')) {
					link.addClass('active');
				}
			}
		});
	}

	// ---------- INICIALIZAÇÃO DA SIDEBAR ----------
	window.initSidebar = function() {

		var $sidebar = $('#sidebar');
		if (!$sidebar.length) {
			console.warn('Sidebar não encontrada. initSidebar() abortada.');
			return;
		}

		var $sidebar_inner = $sidebar.children('.inner'),
			$wrapper = $('#wrapper');

		function syncWrapperWithSidebar() {
			if ($sidebar.hasClass('inactive')) {
				$wrapper.addClass('menu-closed');
			} else {
				$wrapper.removeClass('menu-closed');
			}
		}

		// Fallback object-fit
		if (!browser.canUse('object-fit') || browser.name == 'safari') {
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

		// Inactive por breakpoint
		breakpoints.on('<=k4', function() {
			$sidebar.addClass('inactive');
			syncWrapperWithSidebar();
			// Quando a sidebar fica inativa por breakpoint, também fechamos submenus
			closeAllSubmenus();
		});

		breakpoints.on('>k4', function() {
			$sidebar.removeClass('inactive');
			syncWrapperWithSidebar();
			// Ao reabrir, não fechamos submenus automaticamente, mas podemos manter como está
		});

		// Hack Chrome/Android
		if (browser.os == 'android' && browser.name == 'chrome') {
			$('<style>#sidebar .inner::-webkit-scrollbar { display: none; }</style>')
				.appendTo($head);
		}

		// Toggle button
		$('<a href="#sidebar" class="toggle">Toggle</a>')
			.appendTo($sidebar)
			.on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				$sidebar.toggleClass('inactive');
				syncWrapperWithSidebar();
				// Se a sidebar ficou inativa (fechada), fecha todos os submenus
				if ($sidebar.hasClass('inactive')) {
					closeAllSubmenus();
				}
			});

		// Clique em links
		$sidebar.on('click', 'a', function(event) {
			if (breakpoints.active('>large')) return;

			var $a = $(this),
				href = $a.attr('href'),
				target = $a.attr('target');

			event.preventDefault();
			event.stopPropagation();

			if (!href || href == '#' || href == '') return;

			$sidebar.addClass('inactive');
			syncWrapperWithSidebar();
			// Fecha submenus ao fechar a sidebar
			closeAllSubmenus();

			setTimeout(function() {
				if (target == '_blank')
					window.open(href);
				else
					window.location.href = href;
			}, 500);
		});

		// Previne borbulhamento de eventos touch
		$sidebar.on('click touchend touchstart touchmove', function(event) {
			if (breakpoints.active('>large')) return;
			event.stopPropagation();
		});

		// Clique fora da sidebar (body) fecha a sidebar
		$body.on('click touchend', function(event) {
			if (breakpoints.active('>large')) return;
			$sidebar.addClass('inactive');
			syncWrapperWithSidebar();
			closeAllSubmenus(); // também fecha submenus
		});

		// Scroll lock
		$window.on('load.sidebar-lock', function() {
			var sh, wh, st;

			if ($window.scrollTop() == 1)
				$window.scrollTop(0);

			$window
				.on('scroll.sidebar-lock', function() {
					if (breakpoints.active('<=large')) {
						$sidebar_inner
							.data('locked', 0)
							.css('position', '')
							.css('top', '');
						return;
					}

					var x = Math.max(sh - wh, 0);
					var y = Math.max(0, $window.scrollTop() - x);

					if ($sidebar_inner.data('locked') == 1) {
						if (y <= 0) {
							$sidebar_inner
								.data('locked', 0)
								.css('position', '')
								.css('top', '');
						} else {
							$sidebar_inner
								.css('top', -1 * x);
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
		});

		// Menu com submenus (opener)
		var $menu = $('#menu');
		$menu.find('.opener').each(function() {
			var $this = $(this);
			$this.on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				$this.toggleClass('active');
				$this.closest('li').siblings('li').find('.opener').removeClass('active');
				$window.triggerHandler('resize.sidebar-lock');
			});
		});

		// ---- DESTAQUE DO ITEM ATIVO ----
		highlightCurrentMenuItem();

		// Dispara evento personalizado
		$(document).trigger('sidebar:initialized');
	};

	// Inicialização automática se a sidebar já existir
	$(document).ready(function() {
		if ($('#sidebar').length) {
			window.initSidebar();
		}
	});

})(jQuery);