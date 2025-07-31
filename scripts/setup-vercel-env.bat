@echo off
REM Script para configurar variables de entorno en Vercel
REM Ejecutar: .\scripts\setup-vercel-env.bat

echo 🚀 Configurando variables de entorno en Vercel...
echo ⚠️  IMPORTANTE: Reemplaza los valores con tus datos reales

REM Variables de base de datos Turso
echo 📝 Configurando TURSO_DATABASE_URL...
vercel env add TURSO_DATABASE_URL "TU_URL_DE_TURSO_AQUI" production

echo 📝 Configurando TURSO_AUTH_TOKEN...
vercel env add TURSO_AUTH_TOKEN "TU_TOKEN_DE_TURSO_AQUI" production

REM Variables de aplicación
echo 📝 Configurando JWT_SECRET...
vercel env add JWT_SECRET "TU_JWT_SECRET_SUPER_SEGURO_AQUI" production

echo 📝 Configurando NODE_ENV...
vercel env add NODE_ENV "production" production

echo 📝 Configurando NEXT_PUBLIC_APP_URL...
vercel env add NEXT_PUBLIC_APP_URL "TU_URL_DE_PRODUCCION_AQUI" production

echo ✅ Variables de entorno configuradas en producción
echo 🔄 Ahora ejecuta: vercel --prod para desplegar
echo ⚠️  RECUERDA: Cambiar los valores por tus datos reales 