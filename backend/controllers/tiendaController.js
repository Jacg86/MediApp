// ================================================================
//  Controlador: Tienda
//  Gestión del perfil de la tienda del usuario autenticado
// ================================================================
const TiendaModel = require('../models/tiendaModel');

const TiendaController = {
    /**
     * GET /api/tiendas/mi-tienda
     * Obtener datos de la tienda del usuario autenticado
     */
    async miTienda(req, res, next) {
        try {
            const tienda = await TiendaModel.findByUsuario(req.usuario.id_usuario);

            if (!tienda) {
                return res.status(404).json({
                    success: false,
                    message: 'No tienes una tienda registrada.',
                });
            }

            res.json({
                success: true,
                data: tienda,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/tiendas/mi-tienda
     * Actualizar datos de la tienda
     */
    async actualizar(req, res, next) {
        try {
            const tiendaExistente = await TiendaModel.findByUsuario(req.usuario.id_usuario);

            if (!tiendaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'No tienes una tienda registrada.',
                });
            }

            const { nombre, descripcion, direccion, ciudad } = req.body;

            const tienda = await TiendaModel.update(tiendaExistente.id_tienda, {
                nombre,
                descripcion,
                direccion,
                ciudad,
            });

            res.json({
                success: true,
                message: 'Datos de la tienda actualizados exitosamente.',
                data: tienda,
            });

        } catch (error) {
            next(error);
        }
    },
};

module.exports = TiendaController;
