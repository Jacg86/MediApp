const { query } = require('../config/db');

const AdminController = {
    async getDashboardStats(req, res, next) {
        try {
            // Verificar rol de admin (id_rol = 1)
            if (req.usuario.id_rol !== 1) {
                return res.status(403).json({ success: false, message: 'Acceso denegado. Rol requerido: Admin.' });
            }

            const usersCount = await query('SELECT COUNT(*) FROM usuarios');
            const storesCount = await query('SELECT COUNT(*) FROM tienda');

            res.json({
                success: true,
                data: {
                    totalUsers: parseInt(usersCount.rows[0].count),
                    totalStores: parseInt(storesCount.rows[0].count),
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async getTiendasPendientes(req, res, next) {
        try {
            if (req.usuario.id_rol !== 1) {
                return res.status(403).json({ success: false, message: 'Acceso denegado. Rol requerido: Admin.' });
            }

            const result = await query(`
                SELECT t.id_tienda, t.nombre, t.nit, t.ciudad, t.verificada, u.correo
                FROM tienda t
                JOIN usuarios u ON t.id_usuario = u.id_usuario
                WHERE t.verificada = FALSE
                ORDER BY t.created_at ASC
            `);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            next(error);
        }
    },

    async verificarTienda(req, res, next) {
        try {
            if (req.usuario.id_rol !== 1) {
                return res.status(403).json({ success: false, message: 'Acceso denegado. Rol requerido: Admin.' });
            }

            const { id } = req.params;
            const result = await query(
                'UPDATE tienda SET verificada = TRUE WHERE id_tienda = $1 RETURNING *',
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Tienda no encontrada.' });
            }

            res.json({
                success: true,
                message: 'Tienda verificada exitosamente.',
                data: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = AdminController;
