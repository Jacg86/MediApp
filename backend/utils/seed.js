// ================================================================
//  MediApp — Script de Seed (datos de prueba)
//  Ejecutar después de crear la BD: node backend/utils/seed.js
//  Genera hashes bcrypt reales y puebla las tablas
// ================================================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

async function seed() {
    console.log('\n  MediApp — Ejecutando Seed...\n');

    try {
        // ── Verificar si ya hay datos ────────────────────────────
        const existing = await query('SELECT COUNT(*) FROM roles');
        if (parseInt(existing.rows[0].count) > 0) {
            console.log('  La base de datos ya tiene datos. Seed cancelado.');
            console.log('  Si deseas reiniciar, borra las tablas primero.\n');
            process.exit(0);
        }

        // ── 1. Roles ────────────────────────────────────────────
        console.log('  → Insertando roles...');
        await query(`
            INSERT INTO roles (nombre_rol, descripcion) VALUES
            ('Usuario', 'Usuario registrado con acceso general al sistema'),
            ('Consumidor', 'Consumidor que explora y compra productos en el catálogo'),
            ('Tienda', 'Negocio que publica y gestiona su inventario de productos')
        `);

        // ── 2. Usuarios (con hash bcrypt real) ──────────────────
        console.log('  → Creando usuarios con hash bcrypt...');
        const password = 'mediapp123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        console.log(`  → Hash generado para "${password}": ${hash.substring(0, 30)}...`);

        await query(`
            INSERT INTO usuarios (nombre, correo, contrasena, id_rol, ciudad) VALUES
            ('Admin MediApp', 'admin@mediapp.co', $1, 1, 'Bogotá'),
            ('Ana García', 'ana@correo.com', $1, 2, 'Santa Marta'),
            ('Carlos Pérez', 'carlos@correo.com', $1, 2, 'Barranquilla'),
            ('Droguería Salud Total', 'saludtotal@tienda.com', $1, 3, 'Santa Marta'),
            ('Farmacia Central', 'farmcentral@tienda.com', $1, 3, 'Santa Marta'),
            ('Droguería La Botica', 'labotica@tienda.com', $1, 3, 'Santa Marta'),
            ('Droguería Andina', 'andina@tienda.com', $1, 3, 'Barranquilla'),
            ('Droguería Inglesa', 'inglesa@tienda.com', $1, 3, 'Santa Marta')
        `, [hash]);

        // ── 3. Tiendas ──────────────────────────────────────────
        console.log('  → Insertando tiendas...');
        await query(`
            INSERT INTO tienda (id_usuario, nombre, nit, descripcion, direccion, ciudad, verificada) VALUES
            (4, 'Droguería Salud Total', '900.111.001-1', 'Farmacia con 15 años de experiencia.', 'Cra 3 # 18-42, Centro', 'Santa Marta', TRUE),
            (5, 'Farmacia Central', '900.111.002-2', 'Atención 24 horas, todos los días.', 'Calle 22 # 4-55, El Prado', 'Santa Marta', TRUE),
            (6, 'Droguería La Botica', '900.111.003-3', 'Medicamentos de marca y genéricos.', 'Av. Libertador # 10-30', 'Santa Marta', TRUE),
            (7, 'Droguería Andina', '900.111.004-4', 'Droguería familiar, precios accesibles.', 'Calle 50 # 46-20, El Poblado', 'Barranquilla', FALSE),
            (8, 'Droguería Inglesa', '900.111.005-5', 'Suplementos importados especializados.', 'Cra 5 # 15-10, Rodadero', 'Santa Marta', TRUE)
        `);

        // ── 4. Categorías ───────────────────────────────────────
        console.log('  → Insertando categorías...');
        await query(`
            INSERT INTO categoria (nombre, descripcion) VALUES
            ('Medicamentos', 'Analgésicos, antibióticos, antiinflamatorios y afines'),
            ('Vitaminas', 'Suplementos vitamínicos y minerales'),
            ('Cremas', 'Cremas dermatológicas, hidratantes y tópicas'),
            ('Insumos', 'Material médico: jeringas, gasas, vendajes')
        `);

        // ── 5. Productos ────────────────────────────────────────
        console.log('  → Insertando productos...');
        await query(`
            INSERT INTO producto (id_tienda, id_categoria, nombre, descripcion, precio_original, precio_oferta, stock, fecha_vencimiento) VALUES
            (1, 1, 'Acetaminofén 500mg', 'Analgésico y antipirético. x 100 tabletas. Certificado INVIMA.', 50000.00, 25000.00, 30, CURRENT_DATE + 21),
            (3, 1, 'Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo (AINE). x 50 tabletas.', 18000.00, 0.00, 15, CURRENT_DATE + 14),
            (2, 1, 'Paracetamol 500mg', 'Analgésico seguro para toda la familia. x 80 tabletas.', 30000.00, 15000.00, 25, CURRENT_DATE + 24),
            (3, 1, 'Loratadina 10mg', 'Antihistamínico de segunda generación. x 30 tabletas.', 80000.00, 50000.00, 20, CURRENT_DATE + 14),
            (5, 2, 'Vitamina C 500mg', 'Suplemento antioxidante de alta absorción. x 60 cápsulas.', 35000.00, 20000.00, 40, CURRENT_DATE + 31),
            (4, 3, 'Betametasona Crema', 'Corticoide tópico dermatológico. Tubo 30g.', 55000.00, 30000.00, 12, CURRENT_DATE + 24),
            (2, 2, 'Vitamina D3 1000UI', 'Suplemento para huesos y músculos. x 90 cápsulas blandas.', 45000.00, 28000.00, 18, CURRENT_DATE + 45),
            (1, 1, 'Omeprazol 20mg', 'Inhibidor de bomba de protones. Protege la mucosa gástrica. x 14 cáps.', 22000.00, 12000.00, 8, CURRENT_DATE + 10)
        `);

        // ── 6. Publicaciones ────────────────────────────────────
        console.log('  → Insertando publicaciones...');
        await query(`
            INSERT INTO publicacion (id_producto, titulo, destacada) VALUES
            (1, 'Acetaminofén 500mg — 50% OFF', TRUE),
            (2, 'Ibuprofeno GRATIS — stock limitado', TRUE),
            (3, 'Paracetamol 500mg a mitad de precio', FALSE),
            (4, 'Loratadina 10mg — Liquidación', TRUE),
            (5, 'Vitamina C 500mg — Gran oferta', FALSE),
            (6, 'Betametasona Crema con descuento', FALSE),
            (7, 'Vitamina D3 — Refuerza tus defensas', FALSE),
            (8, 'Omeprazol 20mg — Últimas unidades', TRUE)
        `);

        // ── 7. Carritos de ejemplo ──────────────────────────────
        console.log('  → Creando carritos de ejemplo...');
        await query(`INSERT INTO carrito (id_usuario) VALUES (2), (3)`);
        await query(`
            INSERT INTO item_carrito (id_carrito, id_producto, cantidad, precio_unitario) VALUES
            (1, 1, 2, 25000.00),
            (1, 5, 1, 20000.00),
            (2, 3, 1, 15000.00)
        `);

        // ── 8. Pedido de ejemplo ────────────────────────────────
        console.log('  → Creando pedido de ejemplo...');
        await query(`
            INSERT INTO pedido (id_usuario, estado, metodo_entrega, subtotal, costo_domicilio, total, ahorro_total, direccion_entrega)
            VALUES (2, 'entregado', 'domicilio_express', 45000, 5000, 50000, 30000, 'Calle 15 # 4-32, Apto 201, Santa Marta')
        `);
        await query(`
            INSERT INTO item_pedido (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, precio_original_ref, subtotal_linea) VALUES
            (1, 1, 'Acetaminofén 500mg', 2, 25000.00, 50000.00, 50000.00),
            (1, 5, 'Vitamina C 500mg', 1, 20000.00, 35000.00, 20000.00)
        `);

        console.log('');
        console.log(' Seed completado exitosamente!');
        console.log('');
        console.log('  ┌────────────────────────────────────────────┐');
        console.log('  │  Usuarios de prueba:                       │');
        console.log('  │  ana@correo.com      / mediapp123       │');
        console.log('  │  carlos@correo.com   / mediapp123       │');
        console.log('  │  saludtotal@tienda.com / mediapp123     │');
        console.log('  │  farmcentral@tienda.com / mediapp123    │');
        console.log('  └────────────────────────────────────────────┘');
        console.log('');

    } catch (error) {
        console.error(' Error en Seed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

seed();
