document.addEventListener('DOMContentLoaded', function() {
				const dropdownBtn = document.getElementById('langDropdownBtn');
				const dropdownMenu = document.getElementById('langDropdownMenu');
				const arrow = document.getElementById('langArrow');

				dropdownBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
					this.setAttribute('aria-expanded', expanded);
					dropdownMenu.classList.toggle('show');
					arrow.classList.toggle('open');
				});

				// Fechar ao clicar fora
				document.addEventListener('click', function(e) {
					if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
						dropdownMenu.classList.remove('show');
						dropdownBtn.setAttribute('aria-expanded', 'false');
						arrow.classList.remove('open');
					}
				});

				// Fechar ao pressionar ESC
				document.addEventListener('keydown', function(e) {
					if (e.key === 'Escape') {
						dropdownMenu.classList.remove('show');
						dropdownBtn.setAttribute('aria-expanded', 'false');
						arrow.classList.remove('open');
					}
				});
			});
			