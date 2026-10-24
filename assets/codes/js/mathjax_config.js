/*==========================================================================
Criado em 02/07/2026
Atualizado em 06/10/2026
Autor: Jimi
Coautor: Gemini
Código: mathjax_config.js - Configuração das Regras e Delimitadores TeX/LaTeX
Projeto: Q-Science
==========================================================================*/

/* --------------------------------------------------------------------------
 1. CONFIGURAÇÃO GLOBAL DO MOTOR MATHJAX
 -------------------------------------------------------------------------- */
window.MathJax = {
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ]
  },
  svg: {
    fontCache: 'global'
  }
};