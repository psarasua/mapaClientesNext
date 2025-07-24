// Script para probar el endpoint de login-debug en producción
import fetch from 'node-fetch';

const API_URL = 'https://www.mapaclientes.uy/api/login-debug';

async function testProductionLoginDebug() {
  console.log('🔍 Probando login-debug en producción...\n');
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
    } catch (parseError) {
      console.log('\n⚠️ Response no es JSON válido');
    }

  } catch (error) {
    console.error('\n❌ Error al probar producción:', error);
    console.log('\n🔧 Detalles del error:');
    console.log(`   Nombre: ${error.constructor.name}`);
    console.log(`   Mensaje: ${error.message}`);
    
    if (error.cause) {
      console.log(`   Causa: ${error.cause}`);
    }
  }
}

console.log('🚀 Iniciando prueba de login-debug en producción...\n');
testProductionLoginDebug()
  .then(() => {
    console.log('\n✅ Prueba completada');
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
  });
