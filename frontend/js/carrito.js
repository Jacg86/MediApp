// ================================================================
//  Carrito — Gestión del carrito de compras
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!requiereAuth()) return;
    actualizarNavbar();

    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const btnCheckout = document.getElementById('btn-checkout');

    // ── Cargar carrito ────────────────────────────────────────────
    async function cargarCarrito() {
        try {
            const result = await API.get('/carrito');
            const carrito = result.data;

            if (!carrito.items || carrito.items.length === 0) {
                cartContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🛒</div>
                        <h3>Tu carrito está vacío</h3>
                        <p>Agrega productos desde el catálogo para empezar a comprar.</p>
                        <a href="/home.html" class="btn-back-home">Explorar catálogo</a>
                    </div>
                `;
                if (cartSummary) cartSummary.style.display = 'none';
                if (btnCheckout) btnCheckout.style.display = 'none';
                return;
            }

            let html = '';
            carrito.items.forEach(item => {
                const imagen = getProductImage(item);
                const expireInfo = getExpireInfo(item.dias_para_vencer);
                const subtotal = parseFloat(item.precio_unitario) * item.cantidad;

                html += `
                    <div class="cart-item" data-id="${item.id_item}">
                        <div class="cart-item-image">
                            <img src="${imagen}" alt="${item.nombre}" onerror="this.style.display='none'">
                        </div>
                        <div class="cart-item-info">
                            <h3 class="cart-item-name">${item.nombre}</h3>
                            <p class="cart-item-store">${storeIconSVG()} ${item.tienda_nombre}</p>
                            <span class="expire-date ${expireInfo.clase}" style="font-size:11px;">${expireInfo.texto}</span>
                        </div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateQty(${item.id_item}, ${item.cantidad - 1})">−</button>
                            <span class="qty-value">${item.cantidad}</span>
                            <button class="qty-btn" onclick="updateQty(${item.id_item}, ${item.cantidad + 1})">+</button>
                        </div>
                        <div class="cart-item-price">
                            <span class="price-discount">${formatPrice(subtotal)}</span>
                            <button class="cart-remove-btn" onclick="removeItem(${item.id_item})" title="Eliminar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                `;
            });

            cartContainer.innerHTML = html;

            // Actualizar resumen
            if (cartSummary) {
                const ahorro = carrito.items.reduce((sum, i) => sum + (parseFloat(i.precio_original) - parseFloat(i.precio_unitario)) * i.cantidad, 0);
                cartSummary.style.display = 'block';
                cartSummary.innerHTML = `
                    <div class="summary-row">
                        <span>Productos (${carrito.cantidad_items})</span>
                        <span>${formatPrice(carrito.total)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Envío estimado</span>
                        <span>${formatPrice(5000)}</span>
                    </div>
                    <div class="summary-row summary-savings">
                        <span>Ahorras</span>
                        <span>-${formatPrice(ahorro)}</span>
                    </div>
                    <div class="summary-row summary-total">
                        <span>Total</span>
                        <span>${formatPrice(carrito.total + 5000)}</span>
                    </div>
                `;
            }

            if (btnCheckout) btnCheckout.style.display = 'block';

        } catch (error) {
            console.error('Error cargando carrito:', error);
            cartContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Error al cargar el carrito</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // ── Funciones globales para botones inline ────────────────────
    window.updateQty = async function (idItem, nuevaCantidad) {
        if (nuevaCantidad < 1) {
            removeItem(idItem);
            return;
        }

        try {
            await API.put(`/carrito/items/${idItem}`, { cantidad: nuevaCantidad });
            cargarCarrito();
        } catch (error) {
            showToast(error.message || 'Error al actualizar.', 'error');
        }
    };

    window.removeItem = async function (idItem) {
        try {
            await API.delete(`/carrito/items/${idItem}`);
            showToast('Producto eliminado del carrito.');
            cargarCarrito();
        } catch (error) {
            showToast(error.message || 'Error al eliminar.', 'error');
        }
    };

    // ── Checkout ─────────────────────────────────────────────────
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            window.location.href = '/domicilio.html';
        });
    }

    // ── Inicializar ──────────────────────────────────────────────
    cargarCarrito();
});
