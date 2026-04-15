// ================================================================
//  Rutas: Categorías
// ================================================================
const { Router } = require('express');
const CategoriaController = require('../controllers/categoriaController');

const router = Router();

// GET /api/categorias — público
router.get('/', CategoriaController.listar);

module.exports = router;
