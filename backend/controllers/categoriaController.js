// ================================================================
//  Controlador: Categorías
//  Listar categorías para filtros y formularios
// ================================================================
const CategoriaModel = require('../models/categoriaModel');

const CategoriaController = {
    /**
     * GET /api/categorias
     * Listar todas las categorías activas
     */
    async listar(req, res, next) {
        try {
            const categorias = await CategoriaModel.getAll();

            res.json({
                success: true,
                data: categorias,
            });

        } catch (error) {
            next(error);
        }
    },
};

module.exports = CategoriaController;
