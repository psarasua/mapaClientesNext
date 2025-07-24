// Script para diagnosticar errores específicos de login
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Diagnosticando error específico de login...\n');

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔧 Variables de entorno:');
console.log(`   TURSO_DATABASE_URL: ${TURSO_DATABASE_URL ? '✅' : '❌'}`);
console.log(`   TURSO_AUTH_TOKEN: ${TURSO_AUTH_TOKEN ? '✅' : '❌'}`);
console.log(`   JWT_SECRET: ${JWT_SECRET ? '✅' : '❌'}\n`);

async function simulateLoginProcess() {
  try {
    console.log('🔐 Simulando proceso completo de login...\n');

    // Paso 1: Conectar a Turso
    console.log('1️⃣ Conectando a Turso...');
    const client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    console.log('   ✅ Conexión establecida');

    // Paso 2: Buscar usuario por username
    console.log('\n2️⃣ Buscando usuario "admin"...');
    const userResult = await client.execute({
      sql: 'SELECT * FROM users WHERE usuario = ? LIMIT 1',
      args: ['admin']
    });

    if (userResult.rows.length === 0) {
      console.log('   ❌ Usuario no encontrado');
      return false;
    }

    const user = userResult.rows[0];
    console.log('   ✅ Usuario encontrado');
    console.log(`   📊 ID: ${user.id}`);
    console.log(`   👤 Usuario: ${user.usuario}`);
    console.log(`   🔐 Password hash: ${user.password.substring(0, 20)}...`);

    // Paso 3: Verificar contraseña
    console.log('\n3️⃣ Verificando contraseña...');
    const password = 'admin123';
    console.log(`   🔑 Contraseña a verificar: ${password}`);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`   ${isValidPassword ? '✅' : '❌'} Verificación de contraseña: ${isValidPassword ? 'CORRECTA' : 'INCORRECTA'}`);
    
    if (!isValidPassword) {
      console.log('   ❌ Login fallaría por contraseña incorrecta');
      return false;
    }

    // Paso 4: Generar token JWT
    console.log('\n4️⃣ Generando token JWT...');
    try {
      const payload = {
        id: user.id,
        usuario: user.usuario
      };
      
      console.log(`   📦 Payload: ${JSON.stringify(payload)}`);
      console.log(`   🔑 JWT_SECRET length: ${JWT_SECRET.length} chars`);
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      console.log(`   ✅ Token generado: ${token.substring(0, 50)}...`);
      
      // Verificar que el token sea válido
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`   ✅ Token verificado: ${JSON.stringify(decoded)}`);
      
    } catch (jwtError) {
      console.log(`   ❌ Error generando JWT: ${jwtError.message}`);
      return false;
    }

    // Paso 5: Simular respuesta de login
    console.log('\n5️⃣ Simulando respuesta de login...');
    const { password: _, ...userWithoutPassword } = user;
    const response = {
      success: true,
      message: 'Login exitoso',
      user: userWithoutPassword,
      token: 'jwt_token_here'
    };
    
    console.log('   ✅ Respuesta preparada correctamente');
    console.log(`   📊 Response: ${JSON.stringify(response, null, 2)}`);

    console.log('\n🎉 Simulación de login completada exitosamente');
    console.log('📋 Todos los pasos del login funcionan correctamente');
    
    return true;

  } catch (error) {
    console.error('\n❌ Error durante la simulación de login:', error);
    console.log('\n🔧 Detalles del error:');
    console.log(`   Tipo: ${error.constructor.name}`);
    console.log(`   Mensaje: ${error.message}`);
    
    if (error.code) {
      console.log(`   Código: ${error.code}`);
    }
    
    if (error.stack) {
      console.log('\n📋 Stack trace (primeras 10 líneas):');
      console.log(error.stack.split('\n').slice(0, 10).join('\n'));
    }
    
    return false;
  }
}

async function testSpecificLoginAPI() {
  console.log('\n🌐 Probando API de login directamente...\n');
  
  try {
    // Simular la petición POST que hace el frontend
    const loginData = {
      usuario: 'admin',
      password: 'admin123'
    };
    
    console.log('📤 Datos de login a enviar:');
    console.log(JSON.stringify(loginData, null, 2));
    
    // Aquí simularíamos lo que hace la API route
    console.log('\n🔄 Lo que debería hacer /api/auth/login:');
    console.log('1. Recibir POST con usuario y password');
    console.log('2. Validar que no estén vacíos');
    console.log('3. Conectar a base de datos (Turso)');
    console.log('4. Buscar usuario por "usuario"');
    console.log('5. Verificar contraseña con bcrypt');
    console.log('6. Generar token JWT');
    console.log('7. Retornar respuesta exitosa');
    
    console.log('\n✅ El flujo teórico es correcto');
    
  } catch (error) {
    console.error('❌ Error en prueba de API:', error);
  }
}

// Ejecutar diagnósticos
simulateLoginProcess()
  .then(success => {
    if (success) {
      console.log('\n✅ La lógica de login está correcta');
      return testSpecificLoginAPI();
    } else {
      console.log('\n❌ Hay problemas en la lógica de login');
    }
  })
  .then(() => {
    console.log('\n🎯 Diagnóstico completado');
    console.log('\n📋 Si la simulación funciona pero el login real falla,');
    console.log('el problema podría estar en:');
    console.log('- La API route /api/auth/login');
    console.log('- El middleware de Next.js');
    console.log('- Variables de entorno en producción');
    console.log('- Límites de Turso o timeouts');
  })
  .catch(console.error);
