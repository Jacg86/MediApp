// ================================================================
//  Pedido — Crear pedido y ver historial
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!requiereAuth()) return;
    actualizarNavbar();

    // ── Formulario de domicilio (crear pedido) ───────────────────
    const pedidoForm = document.getElementById('pedido-form');
    if (pedidoForm) {
        pedidoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const direccion = document.getElementById('delivery-address').value.trim();
            const ciudad = document.getElementById('delivery-city').value.trim();
            const telefono = document.getElementById('delivery-phone').value.trim();

            if (!direccion || !ciudad) {
                showToast('La dirección y ciudad son obligatorias.', 'error');
                return;
            }

            const btnConfirm = pedidoForm.querySelector('.btn-submit');
            btnConfirm.disabled = true;
            btnConfirm.textContent = 'Procesando pedido...';

            try {
                const result = await API.post('/pedidos', {
                    metodo_entrega: 'domicilio_express',
                    direccion_entrega: `${direccion}, ${ciudad}`,
                    notas: telefono ? `Tel: ${telefono}` : null,
                });

                showToast('¡Pedido creado exitosamente!');

                setTimeout(() => {
                    window.location.href = '/pedidos.html';
                }, 1200);

            } catch (error) {
                showToast(error.message || 'Error al crear el pedido.', 'error');
                btnConfirm.disabled = false;
                btnConfirm.textContent = 'Confirmar pedido';
            }
        });
    }

    // ── Historial de pedidos ─────────────────────────────────────
    const pedidosList = document.getElementById('pedidos-list');
    if (pedidosList) {
        cargarPedidos();
    }

    async function cargarPedidos() {
        try {
            const result = await API.get('/pedidos');

            if (result.data.length === 0) {
                pedidosList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>No tienes pedidos</h3>
                        <p>Cuando realices tu primera compra, aparecerá aquí.</p>
                        <a href="/home.html" class="btn-back-home">Explorar catálogo</a>
                    </div>
                `;
                return;
            }

            let html = '';
            result.data.forEach(pedido => {
                const items = pedido.items || [];
                const itemsHtml = items.map(i =>
                    `<span class="pedido-item-tag">${i.nombre_producto} x${i.cantidad}</span>`
                ).join('');

                html += `
                    <div class="pedido-card">
                        <div class="pedido-card-header">
                            <div>
                                <span class="pedido-id">Pedido #${pedido.id_pedido}</span>
                                <span class="pedido-fecha">${formatDate(pedido.created_at)}</span>
                            </div>
                            <span class="pedido-estado">${formatEstado(pedido.estado)}</span>
                        </div>
                        <div class="pedido-items">${itemsHtml}</div>
                        <div class="pedido-card-footer">
                            <span class="pedido-metodo">${pedido.metodo_entrega === 'domicilio_express' ? '🏍️ Domicilio Express' : pedido.metodo_entrega === 'programado' ? '📅 Programado' : '🏪 Retiro en tienda'}</span>
                            <span class="pedido-total">Total: ${formatPrice(pedido.total)}</span>
                        </div>
                    </div>
                `;
            });

            pedidosList.innerHTML = html;

        } catch (error) {
            console.error('Error cargando pedidos:', error);
            pedidosList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Error al cargar pedidos</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
});
