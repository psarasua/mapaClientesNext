// Script para probar el endpoint directo
import fetch from 'node-fetch';

const API_URL = 'https://www.mapaclientes.uy/api/direct-login';

async function testDirectLogin() {
  console.log('🔍 Probando direct-login en producción...\n');
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
    console.log(`📋 Response headers:`);
    for (const [key, value] of response.headers) {
      console.log(`   ${key}: ${value}`);
    }

    const data = await response.text();
    console.log(`\n📨 Response body: ${data}`);

    // Intentar parsear como JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('\n📊 Response JSON parsed:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n🎉 ¡DIRECT LOGIN EXITOSO!');
        console.log('🔑 Token recibido:', jsonData.token?.substring(0, 50) + '...');
      } else {
        console.log(`\n❌ Direct login falló: ${jsonData.error}`);
        if (jsonData.debug) {
          console.log('🔧 Debug info:', JSON.stringify(jsonData.debug, null, 2));
        }
      }
    } catch (parseError) {
      console.log('\n⚠️ Response no es JSON válido');
      console.log('📄 Contenido (primeros 500 chars):');
      console.log(data.substring(0, 500));
    }

  } catch (error) {
    console.error('\n❌ Error al conectar:', error);
    console.log('\n🔧 Detalles del error:');
    console.log(`   Nombre: ${error.constructor.name}`);
    console.log(`   Mensaje: ${error.message}`);
  }
}

console.log('🚀 Iniciando prueba del direct-login...\n');
testDirectLogin()
  .then(() => {
    console.log('\n✅ Prueba completada');
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
  });
