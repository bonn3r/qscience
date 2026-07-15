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