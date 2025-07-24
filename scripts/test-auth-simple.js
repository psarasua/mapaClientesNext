// Prueba simple de autenticación
import bcrypt from 'bcryptjs';

async function testAuth() {
  console.log('🔐 Probando sistema de autenticación...\n');
  
  const password = 'admin123';
  console.log(`Contraseña original: ${password}`);
  
  // Hash de contraseña
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log(`Hash generado: ${hashedPassword}\n`);
  
  // Verificar contraseña correcta
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log(`✅ Verificación correcta: ${isValid ? 'ÉXITO' : 'FALLO'}`);
  
  // Verificar contraseña incorrecta
  const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
  console.log(`✅ Verificación incorrecta: ${isInvalid ? 'FALLO (debería ser false)' : 'ÉXITO'}\n`);
  
  if (isValid && !isInvalid) {
    console.log('🎉 Sistema de autenticación funcionando correctamente');
  } else {
    console.log('❌ Problema con el sistema de autenticación');
  }
}

testAuth().catch(console.error);
