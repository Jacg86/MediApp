// ================================================================
//  Modelo: Pedido
//  Consultas SQL para pedidos — usa transacciones para consistencia
// ================================================================
const { pool, query } = require('../config/db');

const PedidoModel = {
    /**
     * Crear un pedido completo a partir de los items del carrito
     * Usa una transacción para garantizar consistencia
     */
    async create({ id_usuario, metodo_entrega, direccion_entrega, notas, items }) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Calcular totales
            let subtotal = 0;
            let ahorro_total = 0;

            for (const item of items) {
                subtotal += item.precio_unitario * item.cantidad;
                ahorro_total += (item.precio_original - item.precio_unitario) * item.cantidad;
            }

            const costo_domicilio = metodo_entrega === 'retiro_tienda' ? 0 : 5000;
            const total = subtotal + costo_domicilio;

            // Insertar pedido
            const pedidoResult = await client.query(
                `INSERT INTO pedido (id_usuario, metodo_entrega, subtotal, costo_domicilio, total, ahorro_total, direccion_entrega, notas)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [id_usuario, metodo_entrega, subtotal, costo_domicilio, total, ahorro_total, direccion_entrega, notas]
            );

            const pedido = pedidoResult.rows[0];

            // Insertar items del pedido
            for (const item of items) {
                await client.query(
                    `INSERT INTO item_pedido (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, precio_original_ref, subtotal_linea)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [pedido.id_pedido, item.id_producto, item.nombre, item.cantidad, item.precio_unitario, item.precio_original, item.precio_unitario * item.cantidad]
                );

                // Reducir stock del producto
                await client.query(
                    `UPDATE producto SET stock = stock - $2 WHERE id_producto = $1 AND stock >= $2`,
                    [item.id_producto, item.cantidad]
                );
            }

            await client.query('COMMIT');
            return pedido;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Obtener pedidos de un usuario
     */
    async getByUsuario(idUsuario) {
        const result = await query(
            `SELECT p.*, 
                    COUNT(ip.id_item) AS total_items,
                    json_agg(json_build_object(
                        'nombre_producto', ip.nombre_producto,
                        'cantidad', ip.cantidad,
                        'precio_unitario', ip.precio_unitario,
                        'subtotal_linea', ip.subtotal_linea
                    )) AS items
             FROM pedido p
             JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
             WHERE p.id_usuario = $1
             GROUP BY p.id_pedido
             ORDER BY p.created_at DESC`,
            [idUsuario]
        );
        return result.rows;
    },

    /**
     * Obtener detalle de un pedido
     */
    async findById(id) {
        const pedidoResult = await query(
            `SELECT * FROM pedido WHERE id_pedido = $1`, [id]
        );

        if (pedidoResult.rows.length === 0) return null;

        const itemsResult = await query(
            `SELECT * FROM item_pedido WHERE id_pedido = $1`, [id]
        );

        return {
            ...pedidoResult.rows[0],
            items: itemsResult.rows,
        };
    },

    /**
     * Actualizar estado del pedido
     */
    async updateEstado(id, estado) {
        const result = await query(
            `UPDATE pedido SET estado = $2 WHERE id_pedido = $1 RETURNING *`,
            [id, estado]
        );
        return result.rows[0] || null;
    },
};

module.exports = PedidoModel;
