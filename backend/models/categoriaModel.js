// ================================================================
//  Modelo: Categoría
//  Consultas SQL para la tabla 'categoria'
// ================================================================
const { query } = require('../config/db');

const CategoriaModel = {
    /**
     * Obtener todas las categorías activas
     */
    async getAll() {
        const result = await query(
            `SELECT * FROM categoria WHERE activa = TRUE ORDER BY nombre`
        );
        return result.rows;
    },

    /**
     * Buscar categoría por ID
     */
    async findById(id) {
        const result = await query(
            `SELECT * FROM categoria WHERE id_categoria = $1 AND activa = TRUE`,
            [id]
        );
        return result.rows[0] || null;
    },
};

module.exports = CategoriaModel;
