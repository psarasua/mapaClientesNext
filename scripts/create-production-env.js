import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Creando archivo .env.production...');

try {
  // Leer el archivo de ejemplo
  const examplePath = path.join(path.dirname(__dirname), 'env.production.example');
  const productionPath = path.join(path.dirname(__dirname), '.env.production');
  
  if (!fs.existsSync(examplePath)) {
    console.error('❌ Error: No se encontró el archivo env.production.example');
    process.exit(1);
  }

  // Leer el contenido del archivo de ejemplo
  const exampleContent = fs.readFileSync(examplePath, 'utf8');
  
  // Crear el archivo .env.production
  fs.writeFileSync(productionPath, exampleContent);
  
  console.log('✅ Archivo .env.production creado exitosamente');
  console.log('📁 Ubicación:', productionPath);
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Revisa y modifica las variables según tu configuración');
  console.log('   - Cambia JWT_SECRET por un valor único y seguro');
  console.log('   - Verifica que las URLs sean correctas para tu dominio');
  console.log('   - Este archivo NO debe subirse a GitHub');
  
} catch (error) {
  console.error('❌ Error al crear el archivo:', error.message);
  process.exit(1);
} 