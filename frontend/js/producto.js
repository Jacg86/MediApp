// ================================================================
//  Producto — Detalle de producto dinámico
// ================================================================
document.addEventListener('DOMContentLoaded', async () => {
    actualizarNavbar();

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        document.querySelector('.product-detail').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❓</div>
                <h3>Producto no especificado</h3>
                <a href="/home.html" class="btn-back-home">Volver al catálogo</a>
            </div>
        `;
        return;
    }

    try {
        const result = await API.get(`/productos/${productId}`);
        const p = result.data;

        const imagen = getProductImage(p);
        const dias = p.dias_para_vencer;
        const expireInfo = getExpireInfo(dias);

        const precioHtml = parseFloat(p.precio_oferta) === 0
            ? `<span class="price-free" style="font-size:24px;">Gratis</span>`
            : `<span class="price-discount" style="font-size:28px;">${formatPrice(p.precio_oferta)}</span>
               <span class="price-original" style="font-size:16px;">${formatPrice(p.precio_original)}</span>`;

        const descuentoInfo = p.descuento_pct && parseFloat(p.descuento_pct) > 0
            ? `<span class="discount-badge-detail">-${p.descuento_pct}% descuento</span>`
            : '';

        document.getElementById('product-title').textContent = p.nombre;
        document.getElementById('product-image').src = imagen;
        document.getElementById('product-image').alt = p.nombre;
        document.getElementById('product-description').textContent = p.descripcion || 'Sin descripción disponible.';
        document.getElementById('product-store').textContent = p.tienda_nombre;
        document.getElementById('product-store-city').textContent = p.tienda_ciudad;
        document.getElementById('product-category').textContent = p.categoria;
        document.getElementById('product-price').innerHTML = precioHtml;
        document.getElementById('product-expire').textContent = expireInfo.texto;
        document.getElementById('product-expire').className = `expire-date ${expireInfo.clase}`;
        document.getElementById('product-stock').textContent = `${p.stock} unidades disponibles`;
        document.getElementById('product-vencimiento').textContent = formatDate(p.fecha_vencimiento);

        if (p.descuento_pct && parseFloat(p.descuento_pct) > 0) {
            document.getElementById('product-descuento').innerHTML = descuentoInfo;
        }

        // ── Botón agregar al carrito ─────────────────────────────
        const btnAddCart = document.getElementById('btn-add-cart');
        if (btnAddCart) {
            btnAddCart.addEventListener('click', async () => {
                if (!estaAutenticado()) {
                    showToast('Inicia sesión para agregar productos al carrito.', 'info');
                    return;
                }

                btnAddCart.disabled = true;
                btnAddCart.textContent = 'Agregando...';

                try {
                    await API.post('/carrito/items', {
                        id_producto: parseInt(productId),
                        cantidad: 1,
                    });

                    showToast('¡Producto agregado al carrito!');
                    btnAddCart.textContent = '✓ Agregado';
                    setTimeout(() => {
                        btnAddCart.disabled = false;
                        btnAddCart.textContent = 'Agregar al carrito';
                    }, 2000);

                } catch (error) {
                    showToast(error.message || 'Error al agregar al carrito.', 'error');
                    btnAddCart.disabled = false;
                    btnAddCart.textContent = 'Agregar al carrito';
                }
            });
        }

        // ── Botón comprar ahora ──────────────────────────────────
        const btnBuyNow = document.getElementById('btn-buy-now');
        if (btnBuyNow) {
            btnBuyNow.addEventListener('click', async () => {
                if (!estaAutenticado()) {
                    showToast('Inicia sesión para comprar.', 'info');
                    return;
                }

                try {
                    await API.post('/carrito/items', {
                        id_producto: parseInt(productId),
                        cantidad: 1,
                    });
                    window.location.href = '/carrito.html';
                } catch (error) {
                    showToast(error.message || 'Error al procesar.', 'error');
                }
            });
        }

    } catch (error) {
        document.querySelector('.product-detail').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">😕</div>
                <h3>Producto no encontrado</h3>
                <p>${error.message}</p>
                <a href="/home.html" class="btn-back-home">Volver al catálogo</a>
            </div>
        `;
    }
});
