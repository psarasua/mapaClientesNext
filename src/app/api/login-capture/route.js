import { NextResponse } from 'next/server';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function POST(request) {
  console.log('🔍 [LOGIN-CAPTURE] Capturando petición de login del frontend...');
  
  try {
    // Capturar headers
    const headers = {};
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value;
    }
    console.log('🔍 [LOGIN-CAPTURE] Headers recibidos:', headers);

    // Capturar body
    const bodyText = await request.text();
    console.log('🔍 [LOGIN-CAPTURE] Body raw:', bodyText);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(bodyText);
      console.log('🔍 [LOGIN-CAPTURE] Body parsed:', parsedBody);
    } catch (parseError) {
      console.log('🔍 [LOGIN-CAPTURE] Error parseando JSON:', parseError.message);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        debug: {
          bodyReceived: bodyText,
          parseError: parseError.message
        }
      }, { status: 400 });
    }

    // Validar campos específicos
    const { usuario, password } = parsedBody;
    console.log(`🔍 [LOGIN-CAPTURE] Usuario: "${usuario}" (length: ${usuario?.length || 0})`);
    console.log(`🔍 [LOGIN-CAPTURE] Password: "${password}" (length: ${password?.length || 0})`);
    console.log(`🔍 [LOGIN-CAPTURE] Usuario type: ${typeof usuario}`);
    console.log(`🔍 [LOGIN-CAPTURE] Password type: ${typeof password}`);

    // Validar datos específicos que esperamos
    if (usuario === 'admin' && password === 'admin123') {
      console.log('🔍 [LOGIN-CAPTURE] ✅ Credenciales correctas recibidas');
      
      // Ahora hacer el login real
      try {
        const { createClient } = await import('@libsql/client');
        const bcrypt = await import('bcryptjs');
        const jwt = await import('jsonwebtoken');
        
        const client = createClient({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });
        
        const result = await client.execute({
          sql: 'SELECT * FROM users WHERE usuario = ? LIMIT 1',
          args: [usuario]
        });

        if (result.rows.length === 0) {
          console.log('🔍 [LOGIN-CAPTURE] ❌ Usuario no encontrado en BD');
          return NextResponse.json({
            success: false,
            error: 'Credenciales inválidas',
            debug: { step: 'user_not_found' }
          }, { status: 401 });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          console.log('🔍 [LOGIN-CAPTURE] ❌ Password inválido');
          return NextResponse.json({
            success: false,
            error: 'Credenciales inválidas',
            debug: { step: 'invalid_password' }
          }, { status: 401 });
        }

        const token = jwt.sign(
          { id: user.id, usuario: user.usuario },
          process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
          { expiresIn: '24h' }
        );

        console.log('🔍 [LOGIN-CAPTURE] ✅ Login exitoso');
        return NextResponse.json({
          success: true,
          message: 'Login exitoso',
          user: {
            id: user.id,
            usuario: user.usuario,
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          token,
          debug: {
            frontend_data_received: parsedBody,
            step: 'success'
          }
        });

      } catch (dbError) {
        console.error('🔍 [LOGIN-CAPTURE] ❌ Error de BD:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Error interno del servidor',
          debug: {
            step: 'database_error',
            error: dbError.message
          }
        }, { status: 500 });
      }

    } else {
      console.log('🔍 [LOGIN-CAPTURE] ❌ Credenciales incorrectas');
      console.log(`🔍 [LOGIN-CAPTURE] Esperado: usuario="admin", password="admin123"`);
      console.log(`🔍 [LOGIN-CAPTURE] Recibido: usuario="${usuario}", password="${password}"`);
      
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas',
        debug: {
          expected: { usuario: 'admin', password: 'admin123' },
          received: { usuario, password },
          step: 'credential_mismatch'
        }
      }, { status: 401 });
    }

  } catch (error) {
    console.error('🔍 [LOGIN-CAPTURE] ❌ Error general:', error);
    return NextResponse.json({
      success: false,
      error: 'Error procesando la solicitud',
      debug: {
        error: error.message,
        step: 'general_error'
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Login capture endpoint - captura y debuggea peticiones del frontend',
    instructions: 'Cambiar el frontend para que apunte a /api/login-capture temporalmente'
  });
}
