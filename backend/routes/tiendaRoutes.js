// ================================================================
//  Rutas: Tiendas
// ================================================================
const { Router } = require('express');
const TiendaController = require('../controllers/tiendaController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = Router();

// Todas las rutas de tiendas requieren autenticación y rol Tienda
router.use(verifyToken, requireRole('Tienda'));

// GET /api/tiendas/mi-tienda
router.get('/mi-tienda', TiendaController.miTienda);

// PUT /api/tiendas/mi-tienda
router.put('/mi-tienda', TiendaController.actualizar);

module.exports = router;
