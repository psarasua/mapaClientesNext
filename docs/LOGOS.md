# Logos de MapaClientes

Este directorio contiene los diferentes logos y componentes relacionados para la aplicación MapaClientes.

## Archivos de Logo

### Archivos SVG Estáticos
- `logo.svg` - Logo completo principal (200x60px)
- `logo-small.svg` - Logo pequeño para iconos (32x32px)
- `logo-social.svg` - Logo para redes sociales y Open Graph (400x200px)
- `favicon.svg` - Favicon de la aplicación (32x32px)

### Componentes React

#### `Logo.jsx`
Componente principal con múltiples variaciones:
- `<Logo />` - Logo completo con texto
- `<LogoSmall />` - Logo pequeño circular
- `<LogoText />` - Solo texto del logo

#### `LogoHorizontal.jsx`
- `<LogoHorizontal />` - Versión horizontal compacta

## Uso de los Componentes

### Logo Principal
```jsx
import { Logo } from '@/components/common/Logo';

<Logo width={200} height={60} className="my-logo" />
```

### Logo Pequeño (para navbar)
```jsx
import { LogoSmall } from '@/components/common/Logo';

<LogoSmall size={32} className="me-2" />
```

### Logo Horizontal
```jsx
import { LogoHorizontal } from '@/components/common/LogoHorizontal';

<LogoHorizontal width={300} height={50} />
```

### Solo Texto
```jsx
import { LogoText } from '@/components/common/Logo';

<LogoText fontSize={18} className="fw-bold" />
```

## Colores del Logo

El logo utiliza la paleta de colores del tema Flatly:

- **Fondo Principal**: `#2c3e50` (Azul oscuro)
- **Color Primario**: `#18bc9c` (Verde turquesa)
- **Texto Principal**: `#ffffff` (Blanco)
- **Texto Secundario**: `#95a5a6` (Gris)
- **Marcadores**: 
  - Rojo: `#e74c3c`
  - Naranja: `#f39c12`
  - Azul: `#3498db`
  - Morado: `#9b59b6`
  - Verde: `#27ae60`

## Implementación Actual

### Navegación
- Navbar principal: `LogoSmall` + texto
- Menú móvil: `LogoSmall` + texto

### Páginas
- Login: `Logo` completo
- Favicon: `favicon.svg`

### Metadatos
- Open Graph: `logo-social.svg`
- Twitter Cards: `logo-social.svg`

## Consideraciones de Diseño

1. **Escalabilidad**: Todos los logos son SVG para máxima calidad
2. **Accesibilidad**: Colores con buen contraste
3. **Branding**: Consistente con el tema Flatly
4. **Responsive**: Se adaptan a diferentes tamaños de pantalla
5. **Carga rápida**: Optimizados para web

## Personalización

Para modificar los logos, edita los archivos SVG correspondientes o los componentes React. Mantén la consistencia de colores con el tema Flatly para una experiencia visual coherente.
