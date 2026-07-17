document.addEventListener('DOMContentLoaded', function() {
    // ============================================================
    // 1. CÓDIGO DE COPIA DO E-MAIL (mantido)
    // ============================================================
    const email = 'willianbonnermelo@gmail.com';
    const icon = document.getElementById('emailIcon');
    const feedback = document.getElementById('feedbackCopiar');
    let timeout = null;

    if (icon && feedback) {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            if (timeout) clearTimeout(timeout);

            navigator.clipboard.writeText(email).then(() => {
                icon.style.filter = 'brightness(0) saturate(100%) invert(40%) sepia(100%) saturate(1000%) hue-rotate(90deg) brightness(100%) contrast(120%)';
                feedback.textContent = 'Copiado!';
                feedback.style.color = '#0d7a3e';
                feedback.style.display = 'block';
                feedback.style.opacity = '1';

                timeout = setTimeout(() => {
                    icon.style.filter = '';
                    feedback.style.opacity = '0';
                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 200);
                }, 3000);
            }).catch(() => {
                icon.style.filter = 'brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(5000%) hue-rotate(0deg) brightness(80%) contrast(110%)';
                feedback.textContent = 'Erro!';
                feedback.style.color = '#b00020';
                feedback.style.display = 'block';
                feedback.style.opacity = '1';

                timeout = setTimeout(() => {
                    icon.style.filter = '';
                    feedback.style.opacity = '0';
                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 200);
                }, 3000);
            });
        });
    }

    // ============================================================
    // 2. CONFIGURAÇÃO DO CAPTCHA E ENVIO DO FORMULÁRIO
    // ============================================================

    let captchaResolvido = false;
    const tooltip = document.getElementById('captchaTooltip');
    const overlay = document.getElementById('thankYouOverlay');
    const countdownSpan = document.getElementById('countdown');

    window.onCaptchaSuccess = function(token) {
        captchaResolvido = true;
        if (tooltip) tooltip.style.display = 'none';
    };

    // Posiciona o balão próximo ao reCAPTCHA (não ao botão)
    function positionTooltip() {
        const captchaContainer = document.querySelector('.g-recaptcha');
        if (!captchaContainer || !tooltip) return;

        const rect = captchaContainer.getBoundingClientRect();
        // Posiciona acima do captcha, centralizado
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 15) + 'px';
        tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
    }

    function showTooltip() {
        if (!tooltip) return;
        positionTooltip();
        tooltip.style.display = 'block';
        tooltip.style.opacity = '1';
        clearTimeout(window.tooltipTimeout);
        window.tooltipTimeout = setTimeout(() => {
            tooltip.style.display = 'none';
        }, 5000);
    }

    // ============================================================
    // 3. INTERCEPTAR O ENVIO (AJAX)
    // ============================================================

    const form = document.querySelector('form[action*="formsubmit.co"]');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!captchaResolvido) {
            showTooltip();
            return;
        }

        const token = grecaptcha.getResponse();
        if (!token) {
            showTooltip();
            return;
        }

        const formData = new FormData(form);

        //formData.append('_excludes', 'g-recaptcha-response,captcha_token',  token);

        try {
            const response = await fetch('https://formsubmit.co/ajax/willianbonnermelo@gmail.com', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Exibe o overlay de agradecimento
                overlay.style.display = 'flex';

                // Contagem regressiva: 10 segundos
                let seconds = 10;
                countdownSpan.textContent = seconds;
                const interval = setInterval(() => {
                    seconds--;
                    countdownSpan.textContent = seconds;
                    if (seconds <= 0) {
                        clearInterval(interval);
                        window.location.href = 'https://bonn3r.github.io/qscience/index.html';
                    }
                }, 1000);

                grecaptcha.reset();
                captchaResolvido = false;

            } else {
                // Erro retornado pelo FormSubmit (ex.: captcha inválido, rate limit, etc.)
                alert('Não foi possível enviar sua mensagem. Verifique o captcha e tente novamente.');
                grecaptcha.reset();
                captchaResolvido = false;
            }

        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro de conexão. Verifique sua internet e tente novamente.');
            grecaptcha.reset();
            captchaResolvido = false;
        }
    });

    // Reajusta o balão se a janela for redimensionada
    window.addEventListener('resize', function() {
        if (tooltip && tooltip.style.display === 'block') {
            positionTooltip();
        }
    });
});