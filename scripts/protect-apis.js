﻿#!/usr/bin/env node

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

// Rutas que deben quedar pÃºblicas
const publicRoutes = [
  'src/app/api/auth/login/route.js',
  'src/app/api/health/route.js'
];

function addAuthToFile(filePath) {
  logger.info(`ðŸ”’ Protegiendo: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene protecciÃ³n
    if (content.includes('requireAuth')) {
      logger.info(`  âœ… Ya estÃ¡ protegido: ${filePath}`);
      return;
    }
    
    // Agregar import de requireAuth
    if (!content.includes("import { requireAuth }")) {
      content = content.replace(
        /import { NextResponse } from 'next\/server';/,
        `import { NextResponse } from 'next/server';\nimport { requireAuth } from '@/lib/apiAuth';`
      );
    }
    
    // Proteger funciÃ³n GET
    content = content.replace(
      /export async function GET\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function GET(${param}) {\n  // Verificar autenticaciÃ³n\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Proteger funciÃ³n POST
    content = content.replace(
      /export async function POST\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function POST(${param}) {\n  // Verificar autenticaciÃ³n\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Proteger funciÃ³n PUT
    content = content.replace(
      /export async function PUT\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function PUT(${param}) {\n  // Verificar autenticaciÃ³n\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Proteger funciÃ³n DELETE
    content = content.replace(
      /export async function DELETE\(\s*([^)]*)\s*\)\s*{/g,
      (match, params) => {
        const param = params.trim() || 'request';
        return `export async function DELETE(${param}) {\n  // Verificar autenticaciÃ³n\n  const authError = requireAuth(${param});\n  if (authError) return authError;\n`;
      }
    );
    
    // Guardar archivo modificado
    fs.writeFileSync(filePath, content);
    logger.info(`  âœ… Protegido exitosamente: ${filePath}`);
    
  } catch (error) {
    logger.info(`  âŒ Error protegiendo ${filePath}: ${error.message}`);
  }
}

// Proteger todas las rutas
logger.info('ðŸ›¡ï¸  Iniciando protecciÃ³n masiva de APIs...\n');

apiRoutes.forEach(routePath => {
  const fullPath = path.resolve(__dirname, '..', routePath);
  if (fs.existsSync(fullPath)) {
    addAuthToFile(fullPath);
  } else {
    logger.info(`âš ï¸  Archivo no encontrado: ${routePath}`);
  }
});

logger.info('\nðŸŽ‰ ProtecciÃ³n masiva completada!');
logger.info('\nðŸ“‹ Rutas protegidas:');
apiRoutes.forEach(route => logger.info(`  âœ… ${route}`));

logger.info('\nðŸŒ Rutas pÃºblicas (sin cambios):');
publicRoutes.forEach(route => logger.info(`  ðŸ”“ ${route}`));

logger.info('\nâš¡ Para probar: curl -X GET http://localhost:3000/api/users/');

