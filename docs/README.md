# DocumentaciÃ³n del Proyecto

## Estructura del Proyecto

### Componentes
- src/components/features/ - Componentes de funcionalidad especÃ­fica
- src/components/maps/ - Componentes relacionados con mapas
- src/components/ui/ - Componentes de interfaz reutilizables
- src/components/layout/ - Componentes de estructura

### Servicios
- src/lib/services/ - Servicios de base de datos por tabla

### Utilidades
- src/lib/config.js - ConfiguraciÃ³n centralizada
- src/lib/logger.js - Sistema de logging
- src/lib/validation.js - Validaciones de datos

## Variables de Entorno Requeridas
- JWT_SECRET - Clave secreta para JWT
- TURSO_DATABASE_URL - URL de la base de datos
- TURSO_AUTH_TOKEN - Token de autenticaciÃ³n de Turso

## Scripts Disponibles
- 
pm run dev - Desarrollo con validaciÃ³n de entorno
- 
pm run build - Build con validaciÃ³n de entorno
- 
pm run validate - Validar variables de entorno
- 
pm run lint - Linting del cÃ³digo
