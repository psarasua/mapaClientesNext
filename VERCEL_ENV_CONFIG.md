# Configuración de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Configurar estas variables en Vercel Dashboard

Para que la aplicación funcione en producción, debes configurar las siguientes variables de entorno en Vercel:

### 📋 Variables requeridas:

1. **DATABASE_URL**
   - Value: `prisma://aws-us-east-2.prisma-data.net/?api_key=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ`
   - Environment: `Production, Preview`

2. **TURSO_DATABASE_URL** 
   - Value: `libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io`
   - Environment: `Production, Preview`

3. **TURSO_AUTH_TOKEN**
   - Value: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ`
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

Después del redeploy, la aplicación debería conectar automáticamente a Turso en producción.

### 🏠 Desarrollo local:

No necesitas cambiar nada. La aplicación usa automáticamente SQLite local (`./data/users.db`) en desarrollo.
