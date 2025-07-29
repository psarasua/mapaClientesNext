// Script para verificar conectividad con la base de datos
import { prisma } from './src/lib/prisma.js';

async function testDatabaseConnection() {
  console.log('🔍 Verificando conexión a la base de datos...');
  console.log('🌍 Entorno:', process.env.NODE_ENV || 'development');
  console.log('🔗 URL de conexión:', process.env.DATABASE_URL ? 'Configurada' : 'No configurada');
  console.log('☁️ Turso URL:', process.env.TURSO_DATABASE_URL ? 'Configurada' : 'No configurada');
  
  try {
    // Intentar una consulta simple
    const userCount = await prisma.user.count();
    const clientCount = await prisma.client.count();
    
    console.log('✅ Conexión exitosa!');
    console.log(`📊 Usuarios: ${userCount}`);
    console.log(`👥 Clientes: ${clientCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('🔧 Solución sugerida:');
    console.error('  1. Verificar variables de entorno en Vercel');
    console.error('  2. Asegurar que DATABASE_URL esté configurada');
    console.error('  3. Verificar token de Turso');
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection();
}

export default testDatabaseConnection;
