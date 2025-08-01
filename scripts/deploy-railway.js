import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando deploy a Railway...');

try {
  // Verificar que estamos en el directorio correcto
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.');
  }

  console.log('📦 Verificando dependencias...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔧 Construyendo proyecto...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('🚀 Deployando a Railway...');
  execSync('railway up', { stdio: 'inherit' });

  console.log('✅ Deploy completado exitosamente!');
  console.log('🌐 Tu aplicación estará disponible en Railway');
  
} catch (error) {
  console.error('❌ Error en el deploy:', error.message);
  process.exit(1);
} 