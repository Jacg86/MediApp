// ================================================================
//  Rutas: Usuarios
// ================================================================
const { Router } = require('express');
const UsuarioController = require('../controllers/usuarioController');
const { verifyToken } = require('../middleware/authMiddleware');
const { perfilRules, passwordRules, handleValidation } = require('../middleware/validators');

const router = Router();

// Todas las rutas de usuarios requieren autenticación
router.use(verifyToken);

// GET /api/usuarios/perfil
router.get('/perfil', UsuarioController.perfil);

// PUT /api/usuarios/perfil
router.put('/perfil', perfilRules, handleValidation, UsuarioController.actualizarPerfil);

// PUT /api/usuarios/password
router.put('/password', passwordRules, handleValidation, UsuarioController.cambiarPassword);

module.exports = router;
