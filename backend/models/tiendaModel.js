// ================================================================
//  Modelo: Tienda
//  Consultas SQL para la tabla 'tienda'
// ================================================================
const { query } = require('../config/db');

const TiendaModel = {
    /**
     * Buscar tienda por ID de usuario
     */
    async findByUsuario(idUsuario) {
        const result = await query(
            `SELECT t.*, u.correo, u.telefono AS telefono_usuario
             FROM tienda t
             JOIN usuarios u ON u.id_usuario = t.id_usuario
             WHERE t.id_usuario = $1 AND t.activa = TRUE`,
            [idUsuario]
        );
        return result.rows[0] || null;
    },

    /**
     * Buscar tienda por ID
     */
    async findById(id) {
        const result = await query(
            `SELECT t.*, u.correo, u.telefono AS telefono_usuario
             FROM tienda t
             JOIN usuarios u ON u.id_usuario = t.id_usuario
             WHERE t.id_tienda = $1 AND t.activa = TRUE`,
            [id]
        );
        return result.rows[0] || null;
    },

    /**
     * Crear una nueva tienda
     */
    async create(idUsuario, { nombre, nit, descripcion, direccion, ciudad }) {
        const result = await query(
            `INSERT INTO tienda (id_usuario, nombre, nit, descripcion, direccion, ciudad)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [idUsuario, nombre, nit, descripcion, direccion, ciudad]
        );
        return result.rows[0];
    },

    /**
     * Actualizar datos de la tienda
     */
    async update(id, { nombre, descripcion, direccion, ciudad }) {
        const result = await query(
            `UPDATE tienda SET
                nombre = COALESCE($2, nombre),
                descripcion = COALESCE($3, descripcion),
                direccion = COALESCE($4, direccion),
                ciudad = COALESCE($5, ciudad)
             WHERE id_tienda = $1 AND activa = TRUE
             RETURNING *`,
            [id, nombre, descripcion, direccion, ciudad]
        );
        return result.rows[0] || null;
    },
};

module.exports = TiendaModel;
