// ================================================================
//  Rutas: Carrito
// ================================================================
const { Router } = require('express');
const CarritoController = require('../controllers/carritoController');
const { verifyToken } = require('../middleware/authMiddleware');
const { carritoItemRules, handleValidation } = require('../middleware/validators');

const router = Router();

// Todas las rutas del carrito requieren autenticación
router.use(verifyToken);

// GET /api/carrito
router.get('/', CarritoController.obtener);

// POST /api/carrito/items
router.post('/items', carritoItemRules, handleValidation, CarritoController.agregarItem);

// PUT /api/carrito/items/:id
router.put('/items/:id', CarritoController.actualizarItem);

// DELETE /api/carrito/items/:id
router.delete('/items/:id', CarritoController.eliminarItem);

module.exports = router;
