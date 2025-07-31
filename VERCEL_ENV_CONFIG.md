# Configuración de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Configurar estas variables en Vercel Dashboard

Para que la aplicación funcione en producción, debes configurar las siguientes variables de entorno en Vercel:

### 📋 Variables requeridas:

1. **DATABASE_URL**
   - Value: `libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ`
   - Environment: `Production, Preview`

2. **TURSO_DATABASE_URL** 
   - Value: `libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io`
   - Environment: `Production, Preview`

3. **TURSO_AUTH_TOKEN**
   - Value: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ`
   - Environment: `Production, Preview`

4. **JWT_SECRET** ⚠️ **NUEVA - REQUERIDA**
   - Value: `produccion-jwt-secret-key-super-segura-cambiar-en-produccion-2025`
   - Environment: `Production, Preview`

5. **NODE_ENV** ⚠️ **NUEVA - REQUERIDA**
   - Value: `production`
   - Environment: `Production, Preview`

6. **NEXT_PUBLIC_APP_URL** ⚠️ **NUEVA - REQUERIDA**
   - Value: `https://mapa-clientes-next.vercel.app` (o tu dominio personalizado)
   - Environment: `Production, Preview`

### 🔧 Cómo configurar:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `mapaClientesNext`
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable con su valor correspondiente
5. Asegúrate de seleccionar `Production` y `Preview` en Environment

### 🔄 Después de configurar:

1. Ve a **Deployments**
2. Buscar el último deployment
3. Click en los 3 puntos → **Redeploy**
4. Seleccionar **Use existing Build Cache** → **Redeploy**

### ✅ Verificación:

Después del redeploy, puedes verificar la configuración visitando:

**🔍 Health Check Completo**: `https://tu-app.vercel.app/api/health`
- Verifica que la API funcione y la base de datos esté conectada
- Verifica específicamente qué variables están configuradas y si son válidas
- Muestra recomendaciones si falta alguna configuración
- Incluye información del deployment de Vercel
- Prueba conectividad real con Turso
- Valida que JWT_SECRET sea funcional

La aplicación debería conectar automáticamente a Turso en producción.

### 🏠 Desarrollo local:

No necesitas cambiar nada. La aplicación usa automáticamente SQLite local (`./data/users.db`) en desarrollo.
