import { NextResponse } from 'next/server';
import { verifyToken } from './auth.js';

/**
 * Helper para proteger rutas de API con autenticación JWT
 * @param {Request} request - Request object de Next.js
 * @returns {Object|null} - Retorna error response o null si está autenticado
 */
export function requireAuth(request) {
  // Obtener token de headers o cookies
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  
  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  // Si no hay token
  if (!token) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token de acceso requerido',
        code: 'NO_TOKEN' 
      },
      { status: 401 }
    );
  }

  // Verificar si el token es válido
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN' 
      },
      { status: 401 }
    );
  }

  // Si llegamos aquí, la autenticación es válida
  return null;
}

/**
 * Helper para verificar permisos de administrador
 * @param {Request} request - Request object de Next.js
 * @returns {Object|null} - Retorna error response o null si es admin
 */
export function requireAdmin(request) {
  // Primero verificar autenticación básica
  const authError = requireAuth(request);
  if (authError) return authError;

  // Obtener y verificar token para rol
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;
  const decoded = verifyToken(token);

  // Verificar si es administrador
  if (decoded.role !== 'admin') {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Permisos de administrador requeridos',
        code: 'INSUFFICIENT_PERMISSIONS' 
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Helper para obtener información del usuario autenticado
 * @param {Request} request - Request object de Next.js
 * @returns {Object|null} - Información del usuario o null
 */
export function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded || null;
}

/**
 * Wrapper para proteger handlers de API completos
 * @param {Function} handler - El handler de la API route
 * @param {Object} options - Opciones de protección
 * @returns {Function} - Handler protegido
 */
export function withAuth(handler, options = {}) {
  return async (request, context) => {
    // Verificar autenticación
    const authError = requireAuth(request);
    if (authError) return authError;

    // Verificar admin si es requerido
    if (options.requireAdmin) {
      const adminError = requireAdmin(request);
      if (adminError) return adminError;
    }

    // Ejecutar el handler original
    return handler(request, context);
  };
}
