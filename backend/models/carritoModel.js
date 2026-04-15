// ================================================================
//  Modelo: Carrito
//  Consultas SQL para la gestión del carrito de compras
// ================================================================
const { query } = require('../config/db');

const CarritoModel = {
    /**
     * Obtener o crear carrito para un usuario
     */
    async getOrCreate(idUsuario) {
        // Intentar obtener el carrito existente
        let result = await query(
            `SELECT * FROM carrito WHERE id_usuario = $1`,
            [idUsuario]
        );

        if (result.rows.length === 0) {
            // Crear nuevo carrito
            result = await query(
                `INSERT INTO carrito (id_usuario) VALUES ($1) RETURNING *`,
                [idUsuario]
            );
        }

        return result.rows[0];
    },

    /**
     * Obtener carrito completo con items y datos de producto
     */
    async getByUsuario(idUsuario) {
        const carrito = await this.getOrCreate(idUsuario);

        const items = await query(
            `SELECT ic.id_item, ic.id_producto, ic.cantidad, ic.precio_unitario, ic.agregado_en,
                    p.nombre, p.descripcion, p.precio_original, p.precio_oferta, p.stock,
                    p.imagen_url, p.fecha_vencimiento,
                    t.nombre AS tienda_nombre,
                    (p.fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer
             FROM item_carrito ic
             JOIN producto p ON p.id_producto = ic.id_producto
             JOIN tienda t ON t.id_tienda = p.id_tienda
             WHERE ic.id_carrito = $1
             ORDER BY ic.agregado_en DESC`,
            [carrito.id_carrito]
        );

        return {
            ...carrito,
            items: items.rows,
            total: items.rows.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0),
            cantidad_items: items.rows.reduce((sum, item) => sum + item.cantidad, 0),
        };
    },

    /**
     * Agregar item al carrito (o actualizar cantidad si ya existe)
     */
    async addItem(idCarrito, idProducto, cantidad, precioUnitario) {
        // Intentar insertar; si ya existe, actualizar cantidad
        const result = await query(
            `INSERT INTO item_carrito (id_carrito, id_producto, cantidad, precio_unitario)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id_carrito, id_producto) 
             DO UPDATE SET cantidad = item_carrito.cantidad + $3
             RETURNING *`,
            [idCarrito, idProducto, cantidad, precioUnitario]
        );
        return result.rows[0];
    },

    /**
     * Actualizar cantidad de un item
     */
    async updateItem(idItem, cantidad) {
        const result = await query(
            `UPDATE item_carrito SET cantidad = $2 WHERE id_item = $1 RETURNING *`,
            [idItem, cantidad]
        );
        return result.rows[0] || null;
    },

    /**
     * Eliminar un item del carrito
     */
    async removeItem(idItem) {
        const result = await query(
            `DELETE FROM item_carrito WHERE id_item = $1 RETURNING *`,
            [idItem]
        );
        return result.rowCount > 0;
    },

    /**
     * Vaciar el carrito completo
     */
    async clear(idCarrito) {
        await query(`DELETE FROM item_carrito WHERE id_carrito = $1`, [idCarrito]);
        return true;
    },
};

module.exports = CarritoModel;
