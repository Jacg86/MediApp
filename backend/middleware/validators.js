// ================================================================
//  Middleware: Validaciones con express-validator
//  Reglas de validación para cada tipo de request
// ================================================================
const { body, param, validationResult } = require('express-validator');

/**
 * Middleware que revisa los resultados de validación
 * Si hay errores, responde con 400 y la lista de errores
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(e => ({
                campo: e.path,
                mensaje: e.msg,
            })),
        });
    }
    next();
};

// ── Reglas de validación ──────────────────────────────────────

const loginRules = [
    body('correo')
        .isEmail().withMessage('Correo electrónico inválido')
        .normalizeEmail(),
    body('contrasena')
        .notEmpty().withMessage('La contraseña es obligatoria'),
];

const registroPersonaRules = [
    body('nombre')
        .trim()
        .isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres'),
    body('correo')
        .isEmail().withMessage('Correo electrónico inválido')
        .normalizeEmail(),
    body('contrasena')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('ciudad')
        .optional()
        .trim()
        .isLength({ max: 100 }),
];

const registroTiendaRules = [
    body('nombre')
        .trim()
        .isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres'),
    body('correo')
        .isEmail().withMessage('Correo electrónico inválido')
        .normalizeEmail(),
    body('contrasena')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
        .optional()
        .trim(),
    body('tienda_nombre')
        .trim()
        .isLength({ min: 3, max: 150 }).withMessage('El nombre del negocio es obligatorio'),
    body('nit')
        .trim()
        .notEmpty().withMessage('El NIT es obligatorio'),
    body('direccion')
        .trim()
        .notEmpty().withMessage('La dirección es obligatoria'),
    body('ciudad')
        .trim()
        .notEmpty().withMessage('La ciudad es obligatoria'),
];

const productoRules = [
    body('nombre')
        .trim()
        .isLength({ min: 2, max: 200 }).withMessage('El nombre del producto es obligatorio'),
    body('id_categoria')
        .isInt({ min: 1 }).withMessage('Categoría inválida'),
    body('precio_original')
        .isFloat({ min: 0 }).withMessage('Precio original inválido'),
    body('precio_oferta')
        .isFloat({ min: 0 }).withMessage('Precio oferta inválido'),
    body('stock')
        .isInt({ min: 0 }).withMessage('Stock inválido'),
    body('fecha_vencimiento')
        .isDate().withMessage('Fecha de vencimiento inválida'),
];

const carritoItemRules = [
    body('id_producto')
        .isInt({ min: 1 }).withMessage('Producto inválido'),
    body('cantidad')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
];

const pedidoRules = [
    body('metodo_entrega')
        .isIn(['domicilio_express', 'programado', 'retiro_tienda']).withMessage('Método de entrega inválido'),
    body('direccion_entrega')
        .optional()
        .trim()
        .isLength({ max: 350 }),
];

const perfilRules = [
    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 3, max: 120 }).withMessage('Nombre inválido'),
    body('ciudad')
        .optional()
        .trim()
        .isLength({ max: 100 }),
    body('telefono')
        .optional()
        .trim()
        .isLength({ max: 20 }),
];

const passwordRules = [
    body('contrasena_actual')
        .notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('contrasena_nueva')
        .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
];

module.exports = {
    handleValidation,
    loginRules,
    registroPersonaRules,
    registroTiendaRules,
    productoRules,
    carritoItemRules,
    pedidoRules,
    perfilRules,
    passwordRules,
};
