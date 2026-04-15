// ================================================================
//  Controlador: Usuario
//  Gestión del perfil del usuario autenticado
// ================================================================
const bcrypt = require('bcryptjs');
const UsuarioModel = require('../models/usuarioModel');

const UsuarioController = {
    /**
     * GET /api/usuarios/perfil
     * Obtener perfil del usuario autenticado
     */
    async perfil(req, res, next) {
        try {
            const usuario = await UsuarioModel.findById(req.usuario.id_usuario);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }

            res.json({
                success: true,
                data: usuario,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/usuarios/perfil
     * Actualizar datos del perfil
     */
    async actualizarPerfil(req, res, next) {
        try {
            const { nombre, ciudad, telefono } = req.body;

            const usuario = await UsuarioModel.update(req.usuario.id_usuario, {
                nombre,
                ciudad,
                telefono,
            });

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }

            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente.',
                data: usuario,
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/usuarios/password
     * Cambiar contraseña
     */
    async cambiarPassword(req, res, next) {
        try {
            const { contrasena_actual, contrasena_nueva } = req.body;

            // Obtener usuario con contraseña
            const usuario = await UsuarioModel.findByEmail(req.usuario.correo);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }

            // Verificar contraseña actual
            const passwordValid = await bcrypt.compare(contrasena_actual, usuario.contrasena);
            if (!passwordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña actual es incorrecta.',
                });
            }

            // Hash de la nueva contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(contrasena_nueva, salt);

            await UsuarioModel.updatePassword(req.usuario.id_usuario, hashedPassword);

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente.',
            });

        } catch (error) {
            next(error);
        }
    },
};

module.exports = UsuarioController;
