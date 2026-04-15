// ================================================================
//  Home — Catálogo dinámico de productos
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    actualizarNavbar();

    const productsGrid = document.getElementById('products-container');
    const loadMoreBtn = document.getElementById('btn-load-more');
    const searchInput = document.getElementById('search-input');
    const filterCategoria = document.getElementById('filter-categoria');
    const filterCiudad = document.getElementById('filter-ciudad');

    let currentOffset = 0;
    const LIMIT = 12;
    let currentFilters = {};

    // ── Cargar categorías en el filtro ────────────────────────────
    async function cargarCategorias() {
        try {
            const result = await API.get('/categorias');
            if (filterCategoria && result.data) {
                result.data.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.nombre;
                    option.textContent = cat.nombre;
                    filterCategoria.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }

    // ── Renderizar tarjeta de producto ────────────────────────────
    function renderProductCard(p) {
        const imagen = getProductImage(p);
        const dias = p.dias_para_vencer;
        const expireInfo = getExpireInfo(dias);

        const precioHtml = parseFloat(p.precio_oferta) === 0
            ? `<span class="price-free">Gratis</span>`
            : `<span class="price-discount">${formatPrice(p.precio_oferta)}</span>
               <span class="price-original">${formatPrice(p.precio_original)}</span>`;

        const descuentoBadge = p.descuento_pct && parseFloat(p.descuento_pct) > 0
            ? `<div class="discount-badge">-${p.descuento_pct}%</div>`
            : '';

        return `
            <a href="/producto.html?id=${p.id_producto}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image-placeholder">
                        ${descuentoBadge}
                        <img class="product-image" src="${imagen}" alt="${p.nombre_producto}" onerror="this.style.display='none'">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${p.nombre_producto}</h3>
                        <div class="store-info">
                            ${storeIconSVG()}
                            ${p.tienda}
                        </div>
                        <div class="price-row">${precioHtml}</div>
                        <div class="expire-date ${expireInfo.clase}">${expireInfo.texto}</div>
                    </div>
                </div>
            </a>
        `;
    }

    // ── Cargar productos ─────────────────────────────────────────
    async function cargarProductos(append = false) {
        try {
            let endpoint = `/productos?limit=${LIMIT}&offset=${currentOffset}`;

            if (currentFilters.categoria) endpoint += `&categoria=${encodeURIComponent(currentFilters.categoria)}`;
            if (currentFilters.ciudad) endpoint += `&ciudad=${encodeURIComponent(currentFilters.ciudad)}`;
            if (currentFilters.buscar) endpoint += `&buscar=${encodeURIComponent(currentFilters.buscar)}`;

            const result = await API.get(endpoint);

            if (!append) {
                productsGrid.innerHTML = '';
            }

            if (result.data.length === 0 && !append) {
                productsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta cambiar los filtros o buscar otro producto.</p>
                    </div>
                `;
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                return;
            }

            result.data.forEach(producto => {
                productsGrid.innerHTML += renderProductCard(producto);
            });

            // Mostrar/ocultar botón "Cargar más"
            if (loadMoreBtn) {
                loadMoreBtn.style.display = result.data.length < LIMIT ? 'none' : 'block';
            }

        } catch (error) {
            console.error('Error cargando productos:', error);
            if (!append) {
                productsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">⚠️</div>
                        <h3>Error al cargar productos</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }

    // ── Eventos ──────────────────────────────────────────────────

    // Cargar más
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentOffset += LIMIT;
            cargarProductos(true);
        });
    }

    // Búsqueda con debounce
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentOffset = 0;
                currentFilters.buscar = e.target.value.trim();
                cargarProductos();
            }, 400);
        });
    }

    // Filtro categoría
    if (filterCategoria) {
        filterCategoria.addEventListener('change', (e) => {
            currentOffset = 0;
            currentFilters.categoria = e.target.value || null;
            cargarProductos();
        });
    }

    // Filtro ciudad
    if (filterCiudad) {
        filterCiudad.addEventListener('change', (e) => {
            currentOffset = 0;
            currentFilters.ciudad = e.target.value || null;
            cargarProductos();
        });
    }

    // Agregar al carrito desde navbar
    const cartBtn = document.getElementById('nav-cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (estaAutenticado()) {
                window.location.href = '/carrito.html';
            } else {
                showToast('Inicia sesión para ver tu carrito.', 'info');
            }
        });
    }

    // ── Inicializar ──────────────────────────────────────────────
    cargarCategorias();
    cargarProductos();
});
