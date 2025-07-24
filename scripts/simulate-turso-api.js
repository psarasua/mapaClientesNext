// Script para simular la API route con Turso (ambiente de producción)
import DatabaseAdapter from '../src/lib/database/adapter.js';
import { verifyPassword, generateToken } from '../src/lib/auth.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// ⚠️ FORZAR ambiente de producción para usar Turso
const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';

console.log('🔍 Simulando API route con Turso (PRODUCCIÓN)...\n');
console.log(`🌍 NODE_ENV forzado a: ${process.env.NODE_ENV}`);
console.log(`🗄️ Esto debería usar Turso en lugar de SQLite\n`);

async function simulateAPIRouteWithTurso() {
  try {
    console.log('1️⃣ Simulando request.json()...');
    const requestBody = {
      usuario: 'admin',
      password: 'admin123'
    };
    console.log(`   📨 Body recibido: ${JSON.stringify(requestBody)}`);
    
    const { usuario, password } = requestBody;
    
    // Validar datos de entrada
    console.log('\n2️⃣ Validando datos de entrada...');
    if (!usuario || !password) {
      console.log('   ❌ Faltan usuario o contraseña');
      return;
    }
    console.log('   ✅ Datos válidos');

    console.log('\n3️⃣ Creando DatabaseAdapter (PRODUCCIÓN - debería usar Turso)...');
    const db = new DatabaseAdapter();
    console.log('   ✅ DatabaseAdapter creado');

    try {
      console.log('\n4️⃣ Buscando usuario en Turso...');
      console.log('   ⏳ Ejecutando db.getUserByUsernameOrEmail()...');
      
      const user = await db.getUserByUsernameOrEmail(usuario);
      
      if (!user) {
        console.log('   ❌ Usuario no encontrado en Turso');
        return;
      }
      
      console.log(`   ✅ Usuario encontrado en Turso: ${user.usuario}`);
      console.log(`   📊 User data: ${JSON.stringify(user, null, 2)}`);

      console.log('\n5️⃣ Verificando contraseña...');
      console.log(`   🔐 Hash almacenado: ${user.password.substring(0, 20)}...`);
      console.log(`   🔑 Password a verificar: ${password}`);
      
      const isValidPassword = await verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        console.log('   ❌ Contraseña inválida');
        return;
      }
      
      console.log('   ✅ Contraseña correcta');

      console.log('\n6️⃣ Generando token JWT...');
      const token = generateToken(user);
      console.log(`   ✅ Token generado: ${token.substring(0, 50)}...`);

      console.log('\n7️⃣ Preparando respuesta...');
      const { password: _, ...userWithoutPassword } = user;

      const response = {
        success: true,
        message: 'Login exitoso',
        user: userWithoutPassword,
        token
      };

      console.log('   ✅ Respuesta preparada');
      console.log(`   📊 Response: ${JSON.stringify(response, null, 2)}`);
      
      console.log('\n🎉 Simulación exitosa con Turso - La API debería funcionar en producción');

    } catch (dbError) {
      console.error('\n❌ Error de base de datos con Turso:', dbError);
      console.log('\n🔧 Detalles del error de Turso:');
      console.log(`   Nombre: ${dbError.constructor.name}`);
      console.log(`   Mensaje: ${dbError.message}`);
      console.log(`   Código: ${dbError.code || 'N/A'}`);
      
      if (dbError.stack) {
        console.log('\n📋 Stack trace (primeras 10 líneas):');
        console.log(dbError.stack.split('\n').slice(0, 10).join('\n'));
      }
      
      // Este es el error que causaría el 500
      console.log('\n🚨 Este error de Turso causaría un 500 en la API real');
      console.log('🔍 Posibles causas:');
      console.log('   - Variables de entorno incorrectas en producción');
      console.log('   - Límites de conexión de Turso');
      console.log('   - Timeouts de red');
      console.log('   - Schema de Turso diferente al esperado');
    }

  } catch (error) {
    console.error('\n❌ Error general en simulación con Turso:', error);
    console.log('\n🔧 Detalles del error:');
    console.log(`   Nombre: ${error.constructor.name}`);
    console.log(`   Mensaje: ${error.message}`);
    
    if (error.stack) {
      console.log('\n📋 Stack trace (primeras 5 líneas):');
      console.log(error.stack.split('\n').slice(0, 5).join('\n'));
    }
    
    // Este es el error que causaría el 500
    console.log('\n🚨 Este error causaría un 500 en la API real');
  } finally {
    // Restaurar NODE_ENV original
    process.env.NODE_ENV = originalNodeEnv;
    console.log(`\n🔄 NODE_ENV restaurado a: ${process.env.NODE_ENV || 'undefined'}`);
  }
}

console.log('🚀 Iniciando simulación con Turso...\n');
simulateAPIRouteWithTurso()
  .then(() => {
    console.log('\n✅ Simulación con Turso completada');
  })
  .catch(error => {
    console.error('\n💥 Error fatal en simulación con Turso:', error);
    process.env.NODE_ENV = originalNodeEnv; // Asegurar restauración
  });
