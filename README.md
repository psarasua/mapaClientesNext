# 🚀 Next.js Fullstack App

Una aplicación fullstack moderna desarrollada con **JavaScript**, **Next.js** y **Bootstrap**, que incluye una base de datos **SQLite** con fallback a **Local Storage**.

## ✨ Características

### 🎯 Frontend
- **React 19** con hooks modernos
- **Next.js 15** con App Router
- **Bootstrap 5** para diseño responsive
- **JavaScript ES6+** (migrado desde TypeScript)
- Componentes interactivos y responsive
- **CRUD completo** para gestión de usuarios
- **Manejo de errores** robusto
- **Estado de API** en tiempo real

## 🛠️ Tecnologías Utilizadas

- [Next.js 15](https://nextjs.org/) - Framework React fullstack
- [React](https://reactjs.org/) - Librería de interfaz de usuario
- [TypeScript](https://www.typescriptlang.org/) - JavaScript con tipos
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitario
- [ESLint](https://eslint.org/) - Linter de código

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.17 o superior
- npm, yarn, pnpm, o bun

### Instalación y Ejecución

1. **Clona el repositorio** (si aplicable):
```bash
git clone <repository-url>
cd nextjs-fullstack
```

2. **Instala las dependencias**:
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Ejecuta el servidor de desarrollo**:
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. **Abre tu navegador** y ve a [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── users/        # CRUD de usuarios
│   │   │   └── route.ts  # GET, POST, PUT, DELETE
│   │   └── health/       # Health check
│   │       └── route.ts  # Estado de la API
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Página de inicio
│   └── globals.css       # Estilos globales
├── components/           # Componentes React
│   ├── UserList.tsx      # Lista y gestión de usuarios
│   └── ApiStatus.tsx     # Estado de la API
├── lib/                  # Utilidades
│   └── api.ts           # Cliente API
└── types/               # Definiciones TypeScript
    └── index.ts         # Tipos principales
```

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Obtener todos los usuarios |
| POST | `/api/users` | Crear nuevo usuario |
| PUT | `/api/users` | Actualizar usuario |
| DELETE | `/api/users?id={id}` | Eliminar usuario |
| GET | `/api/health` | Verificar estado de la API |

### Ejemplo de uso de la API

```typescript
// Obtener usuarios
const response = await fetch('/api/users');
const data = await response.json();

// Crear usuario
const newUser = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  age: 25
};
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newUser)
});
```

## 🎨 Características del Frontend

- **Gestión de usuarios** con interfaz intuitiva
- **Formularios dinámicos** para crear/editar usuarios
- **Tablas responsivas** para mostrar datos
- **Estado de carga** y manejo de errores
- **Confirmaciones** para operaciones destructivas
- **Diseño moderno** con Tailwind CSS

## 🔧 Características del Backend

- **API RESTful** con Next.js API Routes
- **Validación de datos** en el servidor
- **Manejo de errores** consistente
- **Respuestas JSON** estructuradas
- **Base de datos en memoria** (para demo)

- **Validación de datos** en el servidor
- **Manejo de errores** consistente
- **Respuestas JSON** estructuradas
- **Base de datos en memoria** (para demo)

## 📝 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run lint` - Verificar código con ESLint

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📚 Recursos de Aprendizaje

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tutorial de React](https://reactjs.org/tutorial/tutorial.html)
- [Guía de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

## 🔮 Próximas Mejoras

- [ ] Integración con base de datos real (PostgreSQL/MongoDB)
- [ ] Autenticación y autorización
- [ ] Paginación y filtros avanzados
- [ ] Tests unitarios y de integración
- [ ] Deployment automático
- [ ] Documentación API con Swagger

## 🐛 Resolución de Problemas

### Error de compilación
Si encuentras errores de TypeScript, asegúrate de que todos los tipos estén correctamente importados.

### Problemas con Tailwind
Si los estilos no se aplican, verifica que el archivo `tailwind.config.js` esté configurado correctamente.

### API no responde
Verifica que el servidor de desarrollo esté ejecutándose y que los endpoints estén en la ruta correcta.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Hecho con ❤️ usando Next.js y React!**

Para más información sobre Next.js, visita [https://nextjs.org](https://nextjs.org).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
