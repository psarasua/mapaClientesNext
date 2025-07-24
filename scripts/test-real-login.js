// Script para probar el endpoint de login REAL en producción
import fetch from 'node-fetch';

const API_URL = 'https://www.mapaclientes.uy/api/auth/login';

async function testRealProductionLogin() {
  console.log('🔍 Probando login REAL en producción...\n');
  console.log(`🌐 URL: ${API_URL}`);
  
  try {
    console.log('📤 Enviando petición POST...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'admin',
        password: 'admin123'
      })
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);

    const data = await response.text();
    console.log(`📨 Response body: ${data}`);

    // Intentar parsear como JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('\n📊 Response JSON parsed:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n🎉 ¡LOGIN EXITOSO!');
      } else {
        console.log(`\n❌ Login falló: ${jsonData.error}`);
      }
    } catch (parseError) {
      console.log('\n⚠️ Response no es JSON válido - probablemente error 500');
      console.log('📄 Contenido de respuesta (primeros 500 chars):');
      console.log(data.substring(0, 500));
    }

  } catch (error) {
    console.error('\n❌ Error al conectar con producción:', error);
    console.log('\n🔧 Detalles del error:');
    console.log(`   Nombre: ${error.constructor.name}`);
    console.log(`   Mensaje: ${error.message}`);
    
    if (error.cause) {
      console.log(`   Causa: ${error.cause}`);
    }
  }
}

console.log('🚀 Iniciando prueba del login REAL en producción...\n');
testRealProductionLogin()
  .then(() => {
    console.log('\n✅ Prueba completada');
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
  });
