// ================================================================
//  Controlador: Carrito
//  Gestión del carrito de compras del usuario autenticado
// ================================================================
const CarritoModel = require('../models/carritoModel');
const ProductoModel = require('../models/productoModel');

const CarritoController = {
    /**
     * GET /api/carrito
     * Obtener el carrito del usuario actual
     */
    async obtener(req, res, next) {
        try {
            const carrito = await CarritoModel.getByUsuario(req.usuario.id_usuario);

            res.json({
                success: true,
                data: carrito,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/carrito/items
     * Agregar un producto al carrito
     */
    async agregarItem(req, res, next) {
        try {
            const { id_producto, cantidad } = req.body;

            // Verificar que el producto existe y tiene stock
            const producto = await ProductoModel.findById(id_producto);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado.',
                });
            }

            if (producto.stock < cantidad) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente. Disponible: ${producto.stock}`,
                });
            }

            // Obtener o crear carrito
            const carrito = await CarritoModel.getOrCreate(req.usuario.id_usuario);

            // Agregar item
            const item = await CarritoModel.addItem(
                carrito.id_carrito,
                id_producto,
                cantidad,
                producto.precio_oferta
            );

            // Retornar carrito actualizado
            const carritoActualizado = await CarritoModel.getByUsuario(req.usuario.id_usuario);

            res.status(201).json({
                success: true,
                message: 'Producto agregado al carrito.',
                data: carritoActualizado,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/carrito/items/:id
     * Actualizar cantidad de un item del carrito
     */
    async actualizarItem(req, res, next) {
        try {
            const { cantidad } = req.body;

            if (!cantidad || cantidad < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe ser al menos 1.',
                });
            }

            const item = await CarritoModel.updateItem(req.params.id, cantidad);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Item no encontrado en el carrito.',
                });
            }

            const carrito = await CarritoModel.getByUsuario(req.usuario.id_usuario);

            res.json({
                success: true,
                message: 'Cantidad actualizada.',
                data: carrito,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/carrito/items/:id
     * Eliminar un item del carrito
     */
    async eliminarItem(req, res, next) {
        try {
            const eliminado = await CarritoModel.removeItem(req.params.id);
            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Item no encontrado en el carrito.',
                });
            }

            const carrito = await CarritoModel.getByUsuario(req.usuario.id_usuario);

            res.json({
                success: true,
                message: 'Producto eliminado del carrito.',
                data: carrito,
            });

        } catch (error) {
            next(error);
        }
    },
};

module.exports = CarritoController;
