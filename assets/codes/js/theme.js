/*
Criado em: 25/07/2026
Autor: Jimi
Código: Automação da troca de modo claro-escuro
Última atualização:
Versão: 2.0
*/

/*
Criado em: 25/07/2026
Autor: Jimi
Código: Automação da troca de modo claro-escuro
Última atualização: 26/07/2026
Versão: 2.1 – com ícones Font Awesome


(function() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // Ícone dentro do botão (deve existir no HTML)
  const icon = toggle.querySelector('i');
  if (!icon) return;

  // Função para atualizar o ícone
  function updateIcon(isDark) {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Verifica preferência salva
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
    updateIcon(true);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
    updateIcon(true);
  } else {
    updateIcon(false); // estado inicial claro
  }

  // Alterna ao clicar
  toggle.addEventListener('click', function() {
    const isDark = document.body.classList.toggle('dark-mode');
    updateIcon(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
})();

const toggle = document.getElementById('theme-toggle');
const moon = toggle.querySelector('.moon-icon');
const sun = toggle.querySelector('.sun-icon');

function updateIcons(isDark) {
  if (isDark) {
    moon.style.display = 'none';
    sun.style.display = 'block';
  } else {
    moon.style.display = 'block';
    sun.style.display = 'none';
  }
}*/

/*
Criado em: 25/07/2026
Autor: Jimi
Código: Automação da troca de modo claro-escuro
Última atualização: 26/07/2026
Versão: 2.2 – com imagens SVG externas
*/

(function() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const moonImg = document.getElementById('moonImg');
  const sunImg = document.getElementById('sunImg');
  if (!moonImg || !sunImg) return;

  // Função para alternar a visibilidade das imagens
  function updateIcons(isDark) {
    moonImg.style.display = isDark ? 'none' : 'block';
    sunImg.style.display = isDark ? 'block' : 'none';
  }

  // Carrega preferência salva no localStorage
  const saved = localStorage.getItem('theme');
  
  // Verifica preferência do sistema (fallback)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Define o estado inicial
  let isDark = false;
  if (saved === 'dark') {
    isDark = true;
  } else if (saved === 'light') {
    isDark = false;
  } else {
    // Se não houver preferência salva, usa a do sistema
    isDark = prefersDark;
  }

  // Aplica o tema inicial
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  updateIcons(isDark);

  // Alterna ao clicar no botão
  toggle.addEventListener('click', function() {
    const nowDark = document.body.classList.toggle('dark-mode');
    updateIcons(nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  });

  // (Opcional) Escuta mudanças na preferência do sistema em tempo real
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    // Só aplica se o usuário NÃO tiver uma preferência salva manualmente
    if (localStorage.getItem('theme') === null) {
      const systemDark = e.matches;
      document.body.classList.toggle('dark-mode', systemDark);
      updateIcons(systemDark);
    }
  });
})();