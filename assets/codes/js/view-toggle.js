/*==========================================================================
Criado em 10/08/2026
Atualizado em 06/10/2026
Autor: Jimi
Coautor: Gemini
Código: view-toggle.js - Alternância de Layout (Lista / Grelha) para Artigos e Posts
Projeto: Q-Science
==========================================================================*/

(function() {
  'use strict';

  /* --------------------------------------------------------------------------
   1. GESTÃO DO MODO DE VISUALIZAÇÃO (LISTA / GRELHA)
   -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function() {
    var container = document.querySelector('.posts-container');
    var toggleSlider = document.getElementById('viewToggle');

    // Se a página não contiver a listagem de posts ou o seletor, encerra a execução
    if (!container || !toggleSlider) {
      return;
    }

    var labels = toggleSlider.querySelectorAll('.toggle-label');
    var STORAGE_KEY = 'qscience_view_mode';

    /**
     * Aplica as classes correspondentes ao modo de visualização.
     * @param {string} mode - 'list' ou 'grid'
     */
    function setViewMode(mode) {
      // 1. Atualiza as classes do contentor de artigos
      container.classList.remove('list-view', 'grid-view');
      container.classList.add(mode + '-view');

      // 2. Move o cursor indicador visual no seletor
      toggleSlider.classList.remove('list-active', 'grid-active');
      toggleSlider.classList.add(mode + '-active');

      // 3. Destaca o rótulo ativo correspondente
      labels.forEach(function(label) {
        label.classList.remove('active');
        if (label.dataset.view === mode) {
          label.classList.add('active');
        }
      });

      // 4. Salva a preferência no armazenamento local
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (e) {
        // Ignora restrições em navegação anónima/privada
      }
    }

    // Recupera a preferência guardada (predefinido: 'list')
    var savedMode = 'list';
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'list' || stored === 'grid') {
        savedMode = stored;
      }
    } catch (e) {
      // Ignora restrições de armazenamento local
    }
    setViewMode(savedMode);

    // Regista o clique nos seletores de modo
    labels.forEach(function(label) {
      label.addEventListener('click', function() {
        var mode = this.dataset.view;
        if (!mode || this.classList.contains('active')) return;
        setViewMode(mode);
      });
    });
  });

})();