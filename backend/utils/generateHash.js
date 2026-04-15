// ================================================================
//  Utilidad: Generar hash bcrypt para los datos de prueba
//  Ejecutar: node backend/utils/generateHash.js
// ================================================================
const bcrypt = require('bcryptjs');

async function main() {
    const password = 'mediapp123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('');
    console.log('  Contraseña:', password);
    console.log('  Hash bcrypt:', hash);
    console.log('');
    console.log('  Copia este hash en el script.sql para los usuarios de prueba.');
    console.log('');

    // Verificar que funciona
    const match = await bcrypt.compare(password, hash);
    console.log('  Verificación:', match ? '✅ Correcto' : '❌ Error');
}

main().catch(console.error);
