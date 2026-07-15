document.addEventListener('DOMContentLoaded', function() {
    const email = 'willianbonnermelo@gmail.com';
    const icon = document.getElementById('emailIcon');
    const feedback = document.getElementById('feedbackCopiar');
    let timeout = null;

    if (icon && feedback) {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            if (timeout) clearTimeout(timeout);

            navigator.clipboard.writeText(email).then(() => {
                // Sucesso
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
                // Erro
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
});

/*===================================================*/
/* CONFIGURAÇÃO DO CAPTCHA===========================*/
/*===================================================*/


// ============================================================
// 1. Variável para controlar se o captcha foi resolvido
// ============================================================

let captchaResolvido = false;

// ============================================================
// 2. Função chamada quando o captcha é resolvido
// ============================================================

function onCaptchaSuccess(token) {
    captchaResolvido = true;
        // O token é o código gerado, mas não precisamos usá-lo aqui.
        // O FormSubmit já espera o campo "g-recaptcha-response" automaticamente
        // se o formulário for enviado via POST normal. Mas como usaremos AJAX,
        // precisamos incluí-lo manualmente.
}

// ============================================================
// 3. Interceptar o envio do formulário
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action*="formsubmit.co"]');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Impede o envio padrão (que redirecionaria)

            // Verifica se o captcha foi resolvido
            if (!captchaResolvido) {
                alert('Por favor, marque a caixa "Não sou um robô" antes de enviar.');
                return;
            }

            // Obtém o token do reCAPTCHA (gerado automaticamente pelo widget)
            const token = grecaptcha.getResponse();
            if (!token) {
                alert('Erro no captcha. Tente novamente.');
                return;
            }

            // Constrói os dados do formulário (inclui todos os campos)
            const formData = new FormData(form);
            // Adiciona o token explicitamente (necessário para o FormSubmit com AJAX)
            formData.append('g-recaptcha-response', token);

            try {
                // Envia via fetch para o endpoint AJAX do FormSubmit
                const response = await fetch('https://formsubmit.co/ajax/willianbonnermelo@gmail.com', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Sucesso: redireciona para a página de agradecimento
                    window.location.href = 'https://bonn3r.github.io/qscience/obrigado.html';
                } else {
                    // Falha no envio (ex: captcha inválido, erro no servidor)
                    alert('Erro ao enviar a mensagem. Tente novamente mais tarde.');
                    // Reseta o captcha para forçar nova verificação
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
});