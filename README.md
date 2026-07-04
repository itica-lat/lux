# Lux

Sistema de Gestion de Recursos y Servicios Informaticos (SGRSI) para la UTU.

Plataforma web que centraliza la administracion de equipamiento informatico, tickets de soporte tecnico, prestamos de equipos y solicitudes de servicio de una institucion educativa. Disenada para operar con cuatro roles diferenciados: Super Admin, Administrador, Tecnico y Solicitante.

## Stack tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Runtime | [Bun](https://bun.sh) | latest |
| Bundler | [Vite](https://vite.dev) | 8.x |
| UI | [React](https://react.dev) | 19.x |
| Lenguaje | [TypeScript](https://typescriptlang.org) | 6.x |
| Estilos | [TailwindCSS](https://tailwindcss.com) | 4.x |
| Componentes base | [Radix UI](https://radix-ui.com) | 1.x |
| Ruteo | [React Router](https://reactrouter.com) | 7.x |
| Graficos | [Recharts](https://recharts.org) | 2.x |
| Animaciones | [Motion](https://motion.dev) | 12.x |
| Iconos | [Lucide React](https://lucide.dev) | 0.5.x |
| Mocking | [MSW](https://mswjs.io) | 2.x |
| Linting | [oxlint](https://oxc.rs) | 1.x |

### Por que TailwindCSS

Se eligio TailwindCSS como framework de estilos por tres razones principales:

1. **Utilidad sobre opinion**. A diferencia de Bootstrap o MUI, Tailwind no impone un vocabulario visual prefabricado. Esto permitio construir una identidad visual propia alineada con los bocetos iniciales del sistema sin forzar overrides sobre un theme ajeno.

2. **Zero-runtime con Vite**. Tailwind v4 funciona como plugin nativo de Vite via `@tailwindcss/vite`, generando solo el CSS utilizado en build. No hay runtime cost en produccion, a diferencia de soluciones CSS-in-JS.

3. **Design tokens accesibles**. Las variables de diseno (`--color-*`, `--font-size-*`) se mapean directamente a atributos `data-*` en el `<html>`, lo que permite implementar accesibilidad (tema oscuro, alto contraste, tamano de fuente, fuente dislexica) sin logica condicional por componente.

## Estructura del proyecto

```
lux/
├── public/               # Favicon, SVGs, MSW service worker
├── src/
│   ├── assets/           # Imagenes estaticas
│   ├── components/       # Componentes reutilizables
│   │   ├── accessibility/  # FontSizeControl, HighContrastToggle, ThemeSwitcher
│   │   ├── auth/           # ProtectedRoute (guarda por rol)
│   │   ├── charts/         # BarChart, PieChart (wrappers de Recharts)
│   │   ├── layout/         # AppLayout, AdminLayout, Sidebar, Topbar, TabBar
│   │   ├── skeletons/      # Estados de carga (Card, Table, Wizard)
│   │   └── ui/             # Primitivas (Button, Card, Dialog, Input, Select, etc.)
│   ├── features/         # Paginas y modulos de negocio
│   │   ├── admin/          # Dashboard admin, UserManagement, RolesConfig, ActivityLog
│   │   ├── dashboard/      # Dashboard principal con estadisticas
│   │   ├── errors/         # 403, 404, 500
│   │   ├── inventory/      # Inventario, detalle de producto/componente, formularios
│   │   ├── loans/          # Prestamos, formulario de prestamo y devolucion
│   │   ├── login/          # Login y WaitToLogin
│   │   ├── profile/        # Perfil de usuario
│   │   ├── services/       # Solicitudes de servicio, detalle y formulario
│   │   ├── splash/         # Pantalla de bienvenida
│   │   └── tickets/        # Tickets, detalle, wizard multi-step, OOL
│   ├── hooks/            # Hooks de aplicacion
│   │   ├── useAuth.ts      # Autenticacion y control de roles
│   │   ├── useTheme.ts     # Tema, contraste, tamano de fuente, fuente dislexica
│   │   ├── useHaptics.ts   # Feedback haptico
│   │   └── useSkeleton.ts  # Estados de carga para componentes
│   ├── lib/              # Tipos compartidos, constantes, utilidades
│   │   ├── types.ts        # Interfaces de dominio (User, Product, Ticket, Loan, etc.)
│   │   ├── constants.ts    # Rutas, configuraciones de estado, labels
│   │   └── utils.ts        # Funcion gql, cn (classnames), formatters
│   ├── mocks/            # Mock Service Worker (backend simulado)
│   │   ├── data/           # Datos de prueba (users, equipment, tickets, loans, services)
│   │   ├── handlers.ts     # Resolvers GraphQL mockeados
│   │   ├── schema.ts       # Schema GraphQL del sistema
│   │   ├── generators.ts   # Generadores de datos (activity logs, etc.)
│   │   └── browser.ts      # Configuracion del worker para el navegador
│   └── router/
│       └── index.tsx       # Arbol de rutas con lazy loading y guards por rol
├── docs/                 # Documentacion del proyecto
├── package.json
├── vite.config.ts
├── tsconfig.json
└── bun.lock
```

### Separacion por capas

El proyecto organiza el codigo siguiendo una separacion logica estricta:

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **Presentacion** | `features/`, `components/` | UI declarativa. Solo JSX y composicion de componentes. |
| **Estado/Lógica** | `hooks/` | Estado global (auth, theme), reglas de negocio, side effects. |
| **Infraestructura** | `lib/`, `mocks/`, `router/` | Tipos, constantes, comunicacion con la API, ruteo. |

Ningun componente de `features/` contiene logica de negocio: siempre se delega a hooks via `useAuth()`, `useTheme()`, o al mock backend via la funcion `gql()`. Los estilos estan completamente separados del markup: TailwindCSS se aplica por clases utilitarias, sin CSS-in-JS ni estilos inline salvo valores dinamicos puntuales.

## Instalacion y uso

### Requisitos

- [Bun](https://bun.sh) >= 1.2

### Desarrollo local

```bash
# Clonar
git clone https://github.com/itica-lat/lux.git
cd lux

# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev
```

El servidor corre en `http://localhost:5173`. MSW se activa automaticamente en modo desarrollo, simulando el backend GraphQL con datos de prueba.

### Credenciales de prueba

| Rol | DNI | Clave |
|-----|-----|-------|
| Super Admin | `11111111` | `admin123` |
| Administrador | `22222222` | `admin123` |
| Tecnico | `33333333` | `tec123` |
| Solicitante | `44444444` | `sol123` |

### Build de produccion

```bash
bun run build
bun run preview
```

El build genera los archivos estaticos en `dist/`, listos para servir con Nginx o cualquier servidor web.

### Calidad de codigo

```bash
bun typecheck      # Verificar tipos
bun lint           # Linting (oxlint)
bun format         # Formateo (oxfmt)
```

## Modulos del sistema

- **Dashboard** — Estadisticas generales, tickets por estado, servicios por periodo
- **Inventario** — Productos (AIO, desktop, laptop, monitor, servidor, etc.) y componentes internos con soft delete
- **Tickets** — Ciclo completo: creacion → asignacion → diagnostico → resolucion. Wizard multi-step para creacion guiada. Bandeja OOL (sin asignar)
- **Prestamos** — Solicitud, aprobacion, devolucion de equipos con componentes incluidos
- **Servicios** — Preparacion de laboratorios, instalacion de software, configuracion de equipos
- **Administracion** — Gestion de usuarios, configuracion de roles, registro de actividad
- **Accesibilidad** — Tema claro/oscuro, alto contraste, tamano de fuente ajustable, fuente dislexica
