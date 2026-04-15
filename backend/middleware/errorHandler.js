// ================================================================
//  Middleware: Manejo global de errores
//  Captura errores no manejados y responde con formato JSON
// ================================================================

/**
 * Middleware global de errores
 * Debe ir al final de la cadena de middleware en server.js
 */
const errorHandler = (err, req, res, next) => {
    console.error(' Error:', err.message);
    console.error(err.stack);

    // Error de validación de PostgreSQL
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Ya existe un registro con esos datos.',
            detail: err.detail,
        });
    }

    // Error de foreign key
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Referencia inválida. El recurso relacionado no existe.',
            detail: err.detail,
        });
    }

    // Error de constraint check
    if (err.code === '23514') {
        return res.status(400).json({
            success: false,
            message: 'Los datos no cumplen con las restricciones de validación.',
            detail: err.detail,
        });
    }

    // Error genérico
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Error interno del servidor.',
    });
};

module.exports = errorHandler;
