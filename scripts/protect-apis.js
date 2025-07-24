#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de API a proteger
const apiRoutes = [
  'src/app/api/clients/route.js',
  'src/app/api/trucks/route.js', 
  'src/app/api/repartos/route.js',
  'src/app/api/diasEntrega/route.js',
  'src/app/api/clientesporreparto/route.js',
  'src/app/api/admin/route.js',
  'src/app/api/import-excel/route.js'
];

// Rutas que deben quedar públicas
const publicRoutes = [
  'src/app/api/auth/login/route.js',
  'src/app/api/health/route.js'
];

function addAuthToFile(filePath) {
  console.log(`🔒 Protegiendo: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene protección
    if (content.includes('requireAuth')) {
      console.log(`  ✅ Ya está protegido: ${filePath}`);
      return;
    }
    
    // Agregar import de requireAuth
    if (!content.includes("import { requireAuth }")) {
      content = content.replace(
        /import { NextResponse } from 'next\/server';/,
        `import { NextResponse } from 'next/server';\nimport { requireAuth } from '@/lib/apiAuth';`
      );
    }
    
    // Proteger función GET
    content = content.replace(
      /export async function GET\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function GET(${param}) {\n  // Verificar autenticación\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Proteger función POST
    content = content.replace(
      /export async function POST\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function POST(${param}) {\n  // Verificar autenticación\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Proteger función PUT
    content = content.replace(
      /export async function PUT\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function PUT(${param}) {\n  // Verificar autenticación\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Proteger función DELETE
    content = content.replace(
      /export async function DELETE\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function DELETE(${param}) {\n  // Verificar autenticación\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Guardar archivo modificado
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Protegido exitosamente: ${filePath}`);
    
  } catch (error) {
    console.log(`  ❌ Error protegiendo ${filePath}: ${error.message}`);
  }
}

// Proteger todas las rutas
console.log('🛡️  Iniciando protección masiva de APIs...\n');

apiRoutes.forEach(routePath => {
  const fullPath = path.resolve(__dirname, '..', routePath);
  if (fs.existsSync(fullPath)) {
    addAuthToFile(fullPath);
  } else {
    console.log(`⚠️  Archivo no encontrado: ${routePath}`);
  }
});

console.log('\n🎉 Protección masiva completada!');
console.log('\n📋 Rutas protegidas:');
apiRoutes.forEach(route => console.log(`  ✅ ${route}`));

console.log('\n🌍 Rutas públicas (sin cambios):');
publicRoutes.forEach(route => console.log(`  🔓 ${route}`));

console.log('\n⚡ Para probar: curl -X GET http://localhost:3000/api/users/');
