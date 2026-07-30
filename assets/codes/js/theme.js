/*
Criado em: 25/07/2026
Autor: Jimi
Código: Automação da troca de modo claro-escuro
Última atualização: 29/07/2026
Versão: 3.0 – Controle genérico de imagens via data-*
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