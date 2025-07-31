@echo off
REM Script para configurar variables de entorno en Vercel
REM Ejecutar: .\scripts\setup-vercel-env.bat

echo 🚀 Configurando variables de entorno en Vercel...

REM Variables de base de datos Turso
vercel env add DATABASE_URL "libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ" production

vercel env add TURSO_DATABASE_URL "libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io" production

vercel env add TURSO_AUTH_TOKEN "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ" production

REM Variables de aplicación
vercel env add JWT_SECRET "produccion-jwt-secret-key-super-segura-cambiar-en-produccion-2025" production
vercel env add NODE_ENV "production" production
vercel env add NEXT_PUBLIC_APP_URL "https://mapa-clientes-next.vercel.app" production

echo ✅ Variables de entorno configuradas en producción
echo 🔄 Ahora ejecuta: vercel --prod para desplegar
