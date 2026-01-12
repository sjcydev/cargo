# Sistema de Gestión de Carga

Sistema completo para administración de operaciones de envío y carga, incluyendo gestión de clientes, generación de facturas, seguimiento de paquetes y reportes financieros.

## 🚀 Stack Tecnológico

- **Framework**: SvelteKit 5 con TypeScript (modo estricto)
- **Base de datos**: MySQL con Drizzle ORM
- **Autenticación**: Sistema dual (sesiones para admin + magic links para clientes)
- **Validación**: Superforms + Zod
- **UI**: Tailwind CSS + bits-ui
- **Generación PDF**: jsPDF + jspdf-autotable
- **Almacenamiento**: AWS S3 SDK (Backblaze B2)
- **Email**: Resend API
- **Runtime**: Bun

## 📋 Requisitos Previos

- [Bun](https://bun.sh) instalado
- Docker (para MySQL)
- Cuenta de Backblaze B2 (almacenamiento)
- API key de Resend (emails)

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd cargo-v2.5
   ```

2. **Instalar dependencias**
   ```bash
   bun install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

   Editar `.env` con tus credenciales:
   - `DATABASE_URL` - Conexión MySQL (debe incluir `timezone=Z`)
   - `PRIVATE_RESEND_API_KEY` - API key de Resend
   - `BLACKBLAZE_KEY_ID` - ID de Backblaze B2
   - `PRIVATE_BLACKBLAZE_API_KEY` - Key de Backblaze B2
   - `B2_BUCKET_NAME` - Nombre del bucket
   - `API_BASE_URL` - URL del servicio externo de emails
   - `API_KEY` - Key del servicio externo de emails

4. **Configurar base de datos**
   ```bash
   # Iniciar contenedor MySQL
   bun run db:start

   # Las migraciones se ejecutan automáticamente en postinstall
   # O ejecutar manualmente:
   bun run db:migrate
   ```

5. **Seed de datos (opcional)**
   ```bash
   bun run db:seed
   ```

## 🎯 Comandos de Desarrollo

### Desarrollo
```bash
# Iniciar servidor de desarrollo
bun run dev

# Verificación de tipos
bun run check
bun run check:watch
```

### Base de Datos
```bash
bun run db:start      # Iniciar contenedor MySQL
bun run db:push       # Aplicar cambios de schema
bun run db:migrate    # Ejecutar migraciones
bun run db:generate   # Generar nueva migración (usar --name flag)
bun run db:studio     # Abrir Drizzle Studio UI
bun run db:seed       # Seed de datos de prueba
```

### Producción
```bash
# Build de producción
bun run build

# Preview del build
bun run preview
```

## 🏗️ Arquitectura

### Multi-tenancy
El sistema soporta múltiples compañías con jerarquía de tres niveles:
1. **Compañías** - Organización de nivel superior
2. **Sucursales** - Ubicaciones físicas dentro de una compañía
3. **Usuarios** - Empleados asignados a sucursales específicas

### Sistema Dual de Autenticación

**1. Autenticación de Administradores**
- Para empleados (tabla `users`)
- Basado en sesiones con tokens seguros
- Niveles: EMPLEADO, SECRETARIA, ADMIN

**2. Autenticación de Clientes**
- Para clientes (tabla `usuarios`)
- Magic links sin contraseña
- Tipos: REGULAR, ESPECIAL, CORPORATIVO

### Modelos Principales

- **Usuarios (Clientes)**: Clientes que reciben paquetes
- **Facturas**: Facturas con múltiples paquetes (trackings)
- **Trackings**: Paquetes individuales dentro de facturas
- **Reportes**: Reportes financieros agregados

## 📁 Estructura de Rutas

```
Portal de Clientes:
/                           - Dashboard del cliente
/login                      - Login con magic link
/packages                   - Lista de paquetes
/invoices                   - Facturas del cliente
/profile                    - Perfil y logout

Portal de Administración:
/admin                      - Dashboard administrativo
/admin/login                - Login de empleados
/admin/clientes             - Gestión de clientes
/admin/facturas             - Gestión de facturas
/admin/trackings            - Seguimiento de paquetes
/admin/reportes             - Reportes financieros
/admin/settings             - Configuración

API:
/api/auth/*                 - Autenticación de clientes
/api/*                      - Endpoints JSON
```

## 🗄️ Base de Datos

### Compatibilidad MariaDB
**CRÍTICO**: La producción usa MariaDB (no MySQL 8.0+)
- **NUNCA** usar la cláusula `with` de Drizzle (genera LATERAL joins no soportados)
- **SIEMPRE** usar `.select()` con `.leftJoin()` o `.innerJoin()` manualmente

### Configuración UTC
- Zona horaria UTC aplicada doble veces (parámetro de conexión + SET por conexión)
- Crítico para operaciones multi-zona horaria

## 🔒 Seguridad

- Sesiones httpOnly, sameSite: lax
- Tokens criptográficamente seguros (32 bytes)
- Magic links de un solo uso con expiración de 15 minutos
- Soft delete con flag `archivado` (nunca borrar registros)
- Middleware de suspensión de compañías
- Protección contra bots/spam

## 📝 Convenciones de Código

1. **Idioma**: Interfaz y comentarios en español, código en inglés
2. **TypeScript Estricto**: Tipos inferidos de Drizzle
3. **Patrón de Servicios**: Servicios singleton, no repositorios
4. **Manejo de Errores**: Wrapper `apiHandler()` para APIs
5. **Validación**: Schemas Zod en cliente y servidor
6. **Archivado**: Soft delete con `archivado = true`
7. **Svelte 5 Runes**: Usar `$state`, `$derived`, `$props`, `$effect`

## 🎨 UI Components

- **bits-ui**: Componentes headless
- **Tailwind CSS**: Estilos utility-first
- **Mobile-first**: Diseño responsive
- **Portal de Clientes**: Navegación inferior móvil

## 📚 Documentación Adicional

Para guías detalladas de desarrollo, consultar:
- `CLAUDE.md` - Guía completa del proyecto
- `src/lib/server/db/schema.ts` - Schema de base de datos
- `.env.example` - Variables de entorno requeridas

## 🤝 Desarrollo

Este proyecto usa **Bun** como gestor de paquetes. No uses npm, pnpm o yarn.

```bash
# Ejemplo de flujo de trabajo
bun run db:start          # 1. Iniciar MySQL
bun run dev              # 2. Iniciar desarrollo
bun run check:watch      # 3. Verificación de tipos en vivo
bun run db:studio        # 4. Explorar DB (opcional)
```

## 📄 Licencia

Propietario - Todos los derechos reservados
