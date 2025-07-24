import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    });

    // Limpiar la cookie del token
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expira inmediatamente
    });

    return response;

  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json({
      success: false,
      error: 'Error procesando la solicitud'
    }, { status: 500 });
  }
}
