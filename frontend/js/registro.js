// ================================================================
//  Registro — Lógica de registro para persona y tienda
// ================================================================
document.addEventListener('DOMContentLoaded', () => {

    // ── Toggle entre Persona y Tienda ────────────────────────────
    const typeBtns = document.querySelectorAll('.type-btn');
    const formPerson = document.getElementById('form-person');
    const formStore = document.getElementById('form-store');
    const registerTitle = document.getElementById('register-title');
    const registerSubtitle = document.getElementById('register-subtitle');

    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.dataset.type;
            if (type === 'person') {
                formPerson.classList.add('active');
                formStore.classList.remove('active');
                registerTitle.textContent = 'Crea tu cuenta en MediApp';
                registerSubtitle.textContent = 'Únete a nuestra comunidad y empieza a disfrutar de productos de calidad a precios increíbles antes de que expiren.';
            } else {
                formStore.classList.add('active');
                formPerson.classList.remove('active');
                registerTitle.textContent = 'Registra tu tienda';
                registerSubtitle.textContent = 'Únete a MediApp y empieza a vender productos próximos a vencer.';
            }
        });
    });

    // ── Registro Persona ─────────────────────────────────────────
    if (formPerson) {
        formPerson.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('p-name').value.trim();
            const correo = document.getElementById('p-email').value.trim();
            const contrasena = document.getElementById('p-password').value;
            const ciudad = document.getElementById('p-address').value.trim();

            if (!nombre || !correo || !contrasena) {
                showToast('Por favor, completa todos los campos obligatorios.', 'error');
                return;
            }

            if (contrasena.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }

            const btn = formPerson.querySelector('.btn-submit');
            btn.disabled = true;
            btn.textContent = 'Creando cuenta...';

            try {
                const result = await API.post('/auth/registro', {
                    nombre,
                    correo,
                    contrasena,
                    ciudad,
                    tipo: 'persona',
                });

                guardarSesion(result.data.token, result.data.usuario);
                showToast('¡Cuenta creada exitosamente!');

                setTimeout(() => {
                    window.location.href = '/home.html';
                }, 800);

            } catch (error) {
                showToast(error.message || 'Error al crear la cuenta.', 'error');
                btn.disabled = false;
                btn.textContent = 'Crear mi cuenta';
            }
        });
    }

    // ── Registro Tienda ──────────────────────────────────────────
    if (formStore) {
        formStore.addEventListener('submit', async (e) => {
            e.preventDefault();

            const tienda_nombre = document.getElementById('s-name').value.trim();
            const nit = document.getElementById('s-nit').value.trim();
            const direccion = document.getElementById('s-address').value.trim();
            const telefono = document.getElementById('s-phone').value.trim();
            const correo = document.getElementById('s-email').value.trim();
            const contrasena = document.getElementById('s-password').value;

            if (!tienda_nombre || !nit || !direccion || !correo || !contrasena) {
                showToast('Por favor, completa todos los campos obligatorios.', 'error');
                return;
            }

            if (contrasena.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }

            const btn = formStore.querySelector('.btn-submit');
            btn.disabled = true;
            btn.textContent = 'Creando cuenta...';

            try {
                const result = await API.post('/auth/registro', {
                    nombre: tienda_nombre,
                    correo,
                    contrasena,
                    telefono,
                    tipo: 'tienda',
                    tienda_nombre,
                    nit,
                    direccion,
                    ciudad: 'Santa Marta', // Default
                });

                guardarSesion(result.data.token, result.data.usuario);
                showToast('¡Tienda registrada exitosamente!');

                setTimeout(() => {
                    window.location.href = '/home.html';
                }, 800);

            } catch (error) {
                showToast(error.message || 'Error al registrar la tienda.', 'error');
                btn.disabled = false;
                btn.textContent = 'Crear cuenta';
            }
        });
    }

    // ── Toggle password visibility ───────────────────────────────
    document.querySelectorAll('.icon.right').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.closest('.input-with-icon, .password-input-wrapper').querySelector('input[type="password"], input[type="text"]');
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
            }
        });
    });
});
