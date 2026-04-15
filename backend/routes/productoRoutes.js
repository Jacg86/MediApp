// ================================================================
//  Rutas: Productos
// ================================================================
const { Router } = require('express');
const ProductoController = require('../controllers/productoController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { productoRules, handleValidation } = require('../middleware/validators');

const router = Router();

// GET /api/productos — catálogo público
router.get('/', ProductoController.listar);

// GET /api/productos/tienda/mis-productos — mis productos (requiere rol Tienda)
router.get('/tienda/mis-productos', verifyToken, requireRole('Tienda'), ProductoController.misProductos);

// GET /api/productos/:id — detalle de un producto
router.get('/:id', ProductoController.detalle);

// POST /api/productos — crear producto (requiere rol Tienda)
router.post('/', verifyToken, requireRole('Tienda'), productoRules, handleValidation, ProductoController.crear);

// PUT /api/productos/:id — actualizar producto
router.put('/:id', verifyToken, requireRole('Tienda'), ProductoController.actualizar);

// DELETE /api/productos/:id — eliminar producto
router.delete('/:id', verifyToken, requireRole('Tienda'), ProductoController.eliminar);

module.exports = router;
