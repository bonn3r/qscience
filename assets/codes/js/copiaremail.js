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


/*===================================================*/
/* CONFIGURAÇÃO DO CAPTCHA===========================*/
/*===================================================*/

let captchaResolvido = false;

// 1. Função chamada quando o captcha é resolvido
// Anexada ao window para garantir que o script do Google a encontre
window.onCaptchaSuccess = function(token) {
    captchaResolvido = true;
};

// 2. Interceptar o envio do formulário
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action*="formsubmit.co"]');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault(); // Impede o recarregamento da página

        if (!captchaResolvido) {
            alert('Por favor, marque a caixa "Não sou um robô" antes de enviar.');
            return;
        }

        const token = grecaptcha.getResponse();
        if (!token) {
            alert('Erro no captcha. Tente atualizar a página.');
            return;
        }

        const formData = new FormData(form);
        // Opcional: Anexar o token ao payload, embora a validação real seja no frontend
        formData.append('g-recaptcha-response', token);

        try {
            // Usa o endpoint AJAX do FormSubmit
            const response = await fetch('https://formsubmit.co/ajax/willianbonnermelo@gmail.com', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Redireciona para sua página de sucesso
                window.location.href = 'https://bonn3r.github.io/qscience/obrigado.html';
            } else {
                alert('Erro ao enviar a mensagem. Tente novamente mais tarde.');
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