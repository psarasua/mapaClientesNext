import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth.js';

export function middleware(request) {
  console.log('🔍 Middleware ejecutándose para:', request.nextUrl.pathname);
  
  // Rutas que requieren autenticación
  const protectedPaths = [
    '/',
    '/dashboard',
    '/configuracion',
    '/import',
    '/api/users',
    '/api/trucks', 
    '/api/clients',
    '/api/repartos',
    '/api/diasEntrega',
    '/api/clientesporreparto',
    '/api/admin',
    '/api/import-excel'
  ];

  // Rutas públicas (no requieren autenticación)
  const publicPaths = [
    '/login',
    '/api/auth/login',
    '/api/health'
  ];

  const { pathname } = request.nextUrl;

  // Si es una ruta pública, permitir acceso
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('✅ Ruta pública permitida:', pathname);
    return NextResponse.next();
  }

  // Si es una ruta protegida, verificar autenticación
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    console.log('🔒 Verificando autenticación para ruta protegida:', pathname);
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Para rutas API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Token de acceso requerido' },
          { status: 401 }
        );
      }
      
      // Para rutas de páginas, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar si el token es válido
    const decoded = verifyToken(token);
    if (!decoded) {
      // Para rutas API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Token inválido o expirado' },
          { status: 401 }
        );
      }
      
      // Para rutas de páginas, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar permisos de admin para rutas administrativas - REMOVIDO
    // Ahora todos los usuarios autenticados pueden acceder a todas las rutas
    // if (pathname.startsWith('/api/admin') && decoded.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Permisos de administrador requeridos' },
    //     { status: 403 }
    //   );
    // }

    // Agregar información del usuario a los headers para las rutas API
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.id.toString());
      requestHeaders.set('x-user-role', decoded.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
