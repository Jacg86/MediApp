const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/stats', AdminController.getDashboardStats);
router.get('/tiendas-pendientes', AdminController.getTiendasPendientes);
router.put('/tiendas/:id/verificar', AdminController.verificarTienda);

module.exports = router;
