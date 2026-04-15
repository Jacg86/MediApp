// ================================================================
//  Perfil Tienda — Gestión del perfil de la tienda
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!requiereAuth()) return;
    actualizarNavbar();

    const inputNombre = document.getElementById('store-nombre');
    const inputNit = document.getElementById('store-nit');
    const inputDireccion = document.getElementById('store-direccion');
    const inputTelefono = document.getElementById('store-telefono');
    const storeNameHeader = document.querySelector('.store-name-header');

    // ── Cargar datos de la tienda ────────────────────────────────
    async function cargarTienda() {
        try {
            const result = await API.get('/tiendas/mi-tienda');
            const t = result.data;

            if (inputNombre) inputNombre.value = t.nombre;
            if (inputNit) inputNit.value = t.nit;
            if (inputDireccion) inputDireccion.value = t.direccion;
            if (inputTelefono) inputTelefono.value = t.telefono_usuario || '';
            if (storeNameHeader) storeNameHeader.textContent = t.nombre;

        } catch (error) {
            if (error.status === 404) {
                showToast('No tienes una tienda registrada.', 'error');
            } else {
                showToast('Error al cargar la tienda.', 'error');
            }
        }
    }

    // ── Guardar cambios ──────────────────────────────────────────
    const btnSave = document.getElementById('btn-save-store');
    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            const nombre = inputNombre ? inputNombre.value.trim() : null;
            const direccion = inputDireccion ? inputDireccion.value.trim() : null;

            try {
                await API.put('/tiendas/mi-tienda', { nombre, direccion });
                showToast('Datos de la tienda actualizados.');

                if (storeNameHeader && nombre) storeNameHeader.textContent = nombre;

            } catch (error) {
                showToast(error.message || 'Error al actualizar.', 'error');
            }
        });
    }

    // ── Cambiar contraseña ───────────────────────────────────────
    const btnChangePassword = document.getElementById('btn-change-password-store');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', () => {
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

    // ── Logout ───────────────────────────────────────────────────
    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }

    // ── Inicializar ──────────────────────────────────────────────
    cargarTienda();
});
