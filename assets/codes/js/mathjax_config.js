/*
	Criado por: Jimi.7z (Willian Bonner) em 02/07/2026
	Última atualização: 
	Arquivo: Configuração da biblioteca MathJax. Serve para exibir equações com latex no site
	Versão: 1.0
*/

MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
    },
    svg: {
        fontCache: 'global'
    }
};