// ================================================================
//  Perfil — Gestión del perfil de usuario
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!requiereAuth()) return;
    actualizarNavbar();

    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const inputName = document.getElementById('perfil-nombre');
    const inputEmail = document.getElementById('perfil-correo');
    const inputDireccion = document.getElementById('perfil-direccion');

    // ── Cargar datos del perfil ──────────────────────────────────
    async function cargarPerfil() {
        try {
            const result = await API.get('/usuarios/perfil');
            const u = result.data;

            if (profileName) profileName.textContent = u.nombre;
            if (profileEmail) profileEmail.textContent = u.correo;
            if (inputName) inputName.value = u.nombre;
            if (inputEmail) inputEmail.value = u.correo;
            if (inputDireccion) inputDireccion.value = u.ciudad || '';

        } catch (error) {
            showToast('Error al cargar el perfil.', 'error');
        }
    }

    // ── Editar información personal ──────────────────────────────
    const btnEditInfo = document.getElementById('btn-edit-info');
    if (btnEditInfo) {
        btnEditInfo.addEventListener('click', async () => {
            const nombre = inputName ? inputName.value.trim() : null;
            const ciudad = inputDireccion ? inputDireccion.value.trim() : null;

            if (nombre && nombre.length < 3) {
                showToast('El nombre debe tener al menos 3 caracteres.', 'error');
                return;
            }

            try {
                const result = await API.put('/usuarios/perfil', { nombre, ciudad });
                showToast('Perfil actualizado exitosamente.');

                // Actualizar localStorage
                const user = obtenerUsuario();
                if (user && nombre) {
                    user.nombre = nombre;
                    localStorage.setItem('mediapp_usuario', JSON.stringify(user));
                }

                if (profileName && nombre) profileName.textContent = nombre;

            } catch (error) {
                showToast(error.message || 'Error al actualizar.', 'error');
            }
        });
    }

    // ── Editar dirección ─────────────────────────────────────────
    const btnEditDir = document.getElementById('btn-edit-direccion');
    if (btnEditDir) {
        btnEditDir.addEventListener('click', async () => {
            const ciudad = inputDireccion ? inputDireccion.value.trim() : null;

            try {
                await API.put('/usuarios/perfil', { ciudad });
                showToast('Dirección actualizada exitosamente.');
            } catch (error) {
                showToast(error.message || 'Error al actualizar.', 'error');
            }
        });
    }

    // ── Cambiar contraseña ───────────────────────────────────────
    const btnChangePassword = document.getElementById('btn-change-password');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', () => {
            // Crear modal de cambio de contraseña
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Cambiar Contraseña</h3>
                    <div class="form-group">
                        <label>Contraseña actual</label>
                        <input type="password" id="pwd-actual" placeholder="Tu contraseña actual">
                    </div>
                    <div class="form-group">
                        <label>Nueva contraseña</label>
                        <input type="password" id="pwd-nueva" placeholder="Mínimo 6 caracteres">
                    </div>
                    <div class="modal-actions">
                        <button class="btn-light-green" id="btn-confirm-pwd">Guardar</button>
                        <button class="btn-gray-outline" id="btn-cancel-pwd" style="width:auto;padding:10px 20px;">Cancelar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('btn-cancel-pwd').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

            document.getElementById('btn-confirm-pwd').addEventListener('click', async () => {
                const contrasena_actual = document.getElementById('pwd-actual').value;
                const contrasena_nueva = document.getElementById('pwd-nueva').value;

                if (!contrasena_actual || !contrasena_nueva) {
                    showToast('Completa ambos campos.', 'error');
                    return;
                }

                if (contrasena_nueva.length < 6) {
                    showToast('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
                    return;
                }

                try {
                    await API.put('/usuarios/password', { contrasena_actual, contrasena_nueva });
                    showToast('Contraseña actualizada exitosamente.');
                    modal.remove();
                } catch (error) {
                    showToast(error.message || 'Error al cambiar la contraseña.', 'error');
                }
            });
        });
    }

    // ── Inicializar ──────────────────────────────────────────────
    cargarPerfil();
});
