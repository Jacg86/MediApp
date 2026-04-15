// ================================================================
//  Auth — Lógica del login y registro
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Si ya está autenticado, redirigir al home
    if (estaAutenticado() && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
        window.location.href = '/home.html';
        return;
    }

    // ── Login Form ───────────────────────────────────────────────
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const correo = document.getElementById('email').value.trim();
            const contrasena = document.getElementById('password').value;
            const btnSubmit = loginForm.querySelector('.btn-submit');

            if (!correo || !contrasena) {
                showToast('Por favor, completa todos los campos.', 'error');
                return;
            }

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Iniciando sesión...';

            try {
                const result = await API.post('/auth/login', { correo, contrasena });

                guardarSesion(result.data.token, result.data.usuario);
                showToast('¡Bienvenido, ' + result.data.usuario.nombre + '!');

                setTimeout(() => {
                    window.location.href = '/home.html';
                }, 800);

            } catch (error) {
                showToast(error.message || 'Error al iniciar sesión', 'error');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Iniciar sesión';
            }
        });
    }

    // ── Toggle password visibility ───────────────────────────────
    const eyeIcon = document.querySelector('.eye-icon');
    if (eyeIcon) {
        eyeIcon.addEventListener('click', () => {
            const pwdInput = document.getElementById('password');
            pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
        });
    }
});
