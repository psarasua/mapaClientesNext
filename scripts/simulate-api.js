// Script para simular exactamente la API route de login
import DatabaseAdapter from '../src/lib/database/adapter.js';
import { verifyPassword, generateToken } from '../src/lib/auth.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Simulando exactamente la API route /api/auth/login...\n');

async function simulateAPIRoute() {
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

    console.log('\n3️⃣ Creando DatabaseAdapter...');
    const db = new DatabaseAdapter();
    console.log('   ✅ DatabaseAdapter creado');

    try {
      console.log('\n4️⃣ Buscando usuario...');
      const user = await db.getUserByUsernameOrEmail(usuario);
      
      if (!user) {
        console.log('   ❌ Usuario no encontrado');
        return;
      }
      
      console.log(`   ✅ Usuario encontrado: ${user.usuario}`);

      console.log('\n5️⃣ Verificando contraseña...');
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
      
      console.log('\n🎉 Simulación exitosa - La API debería funcionar');

    } catch (dbError) {
      console.error('\n❌ Error de base de datos en simulación:', dbError);
      console.log('\n🔧 Detalles del error de DB:');
      console.log(`   Mensaje: ${dbError.message}`);
      console.log(`   Stack: ${dbError.stack?.split('\n').slice(0, 5).join('\n')}`);
      
      // Este es el error que causaría el 500
      console.log('\n🚨 Este error causaría un 500 en la API real');
    }

  } catch (error) {
    console.error('\n❌ Error general en simulación:', error);
    console.log('\n🔧 Detalles del error:');
    console.log(`   Mensaje: ${error.message}`);
    console.log(`   Stack: ${error.stack?.split('\n').slice(0, 5).join('\n')}`);
    
    // Este es el error que causaría el 500
    console.log('\n🚨 Este error causaría un 500 en la API real');
  }
}

console.log('🚀 Iniciando simulación...\n');
simulateAPIRoute()
  .then(() => {
    console.log('\n✅ Simulación completada');
  })
  .catch(error => {
    console.error('\n💥 Error fatal en simulación:', error);
  });
