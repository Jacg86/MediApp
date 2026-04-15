// ================================================================
//  Controlador: Productos
//  CRUD completo de productos y catálogo público
// ================================================================
const ProductoModel = require('../models/productoModel');
const TiendaModel = require('../models/tiendaModel');

const ProductoController = {
    /**
     * GET /api/productos
     * Listar catálogo activo con filtros opcionales
     */
    async listar(req, res, next) {
        try {
            const { categoria, ciudad, precio_min, precio_max, dias_max, limit, offset, buscar } = req.query;

            // Si hay búsqueda, usar el método de búsqueda
            if (buscar) {
                const resultados = await ProductoModel.search(buscar, parseInt(limit) || 20);
                return res.json({
                    success: true,
                    data: resultados,
                    total: resultados.length,
                });
            }

            const productos = await ProductoModel.getCatalogo({
                categoria: categoria || null,
                ciudad: ciudad || null,
                precioMin: precio_min ? parseFloat(precio_min) : undefined,
                precioMax: precio_max ? parseFloat(precio_max) : undefined,
                diasMax: dias_max ? parseInt(dias_max) : undefined,
                limit: parseInt(limit) || 20,
                offset: parseInt(offset) || 0,
            });

            res.json({
                success: true,
                data: productos,
                total: productos.length,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/productos/:id
     * Obtener detalle de un producto
     */
    async detalle(req, res, next) {
        try {
            const producto = await ProductoModel.findById(req.params.id);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado.',
                });
            }

            res.json({
                success: true,
                data: producto,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/productos
     * Crear un nuevo producto (solo tiendas)
     */
    async crear(req, res, next) {
        try {
            // Obtener la tienda del usuario autenticado
            const tienda = await TiendaModel.findByUsuario(req.usuario.id_usuario);
            if (!tienda) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes una tienda registrada.',
                });
            }

            const { nombre, descripcion, id_categoria, precio_original, precio_oferta, stock, fecha_vencimiento, imagen_url, titulo_publicacion } = req.body;

            // Crear producto
            const producto = await ProductoModel.create({
                id_tienda: tienda.id_tienda,
                id_categoria,
                nombre,
                descripcion: descripcion || null,
                precio_original,
                precio_oferta,
                stock,
                fecha_vencimiento,
                imagen_url: imagen_url || null,
            });

            // Crear publicación
            const tituloFinal = titulo_publicacion || `${nombre} — Oferta`;
            await ProductoModel.createPublicacion(producto.id_producto, tituloFinal);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente.',
                data: producto,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/productos/:id
     * Actualizar un producto existente (solo dueño de la tienda)
     */
    async actualizar(req, res, next) {
        try {
            const tienda = await TiendaModel.findByUsuario(req.usuario.id_usuario);
            if (!tienda) {
                return res.status(403).json({ success: false, message: 'No tienes una tienda registrada.' });
            }

            // Verificar que el producto pertenece a la tienda del usuario
            const productoExistente = await ProductoModel.findById(req.params.id);
            if (!productoExistente || productoExistente.id_tienda !== tienda.id_tienda) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para editar este producto.' });
            }

            const producto = await ProductoModel.update(req.params.id, req.body);

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente.',
                data: producto,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/productos/:id
     * Eliminar un producto (soft delete)
     */
    async eliminar(req, res, next) {
        try {
            const tienda = await TiendaModel.findByUsuario(req.usuario.id_usuario);
            if (!tienda) {
                return res.status(403).json({ success: false, message: 'No tienes una tienda registrada.' });
            }

            const productoExistente = await ProductoModel.findById(req.params.id);
            if (!productoExistente || productoExistente.id_tienda !== tienda.id_tienda) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este producto.' });
            }

            await ProductoModel.delete(req.params.id);

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente.',
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/productos/tienda/mis-productos
     * Obtener productos de mi tienda
     */
    async misProductos(req, res, next) {
        try {
            const tienda = await TiendaModel.findByUsuario(req.usuario.id_usuario);
            if (!tienda) {
                return res.status(403).json({ success: false, message: 'No tienes una tienda registrada.' });
            }

            const productos = await ProductoModel.getByTienda(tienda.id_tienda);

            res.json({
                success: true,
                data: productos,
                total: productos.length,
            });

        } catch (error) {
            next(error);
        }
    },
};

module.exports = ProductoController;
