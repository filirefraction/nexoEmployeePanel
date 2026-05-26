# nexoEmployeePanel

Portal web del empleado para `Nexo`, construido en Angular 21 con enfoque mobile-first.

## Contexto obligatorio

Este proyecto usa como base de contexto:

- [AGENTS.md](</C:/Repo/Angular/nexoEmployeePanel/AGENTS.md>)
- `C:\Repo\Docs\Nexo\shared`
- `C:\Repo\Docs\Nexo\frontend`

Documentos principales:

- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_BUSINESS_RULES.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_ARCHITECTURE_CONTEXT.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_IMPLEMENTATION_GUIDE.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_MODULES_AND_ROUTES.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_OPENAPI_INTEGRATION.md`

## Alcance actual

Hoy el panel ya cubre:

- login, logout y refresh token
- sesión y guards por compatibilidad de portal empleado
- dashboard conectado a `employee-summary`
- attendance:
  - historial propio
  - check-in
  - check-out
- vacations:
  - listado propio
  - detalle
  - creación
  - cancelación
- perfil propio en modo solo lectura
- pantallas de sistema:
  - acceso restringido
  - sesión expirada
  - not found

## Comandos útiles

Desarrollo:

```powershell
npm.cmd start
```

Build:

```powershell
npm.cmd run build
```

Tests:

```powershell
npm.cmd test -- --watch=false
```

## Backend esperado

El panel consume `nexoApi` en:

- `http://localhost:5031`

Endpoints principales ya usados:

- `POST /api/auth/v1/auth/login`
- `POST /api/auth/v1/auth/refresh`
- `POST /api/auth/v1/auth/logout`
- `GET /api/auth/v1/auth/me`
- `GET /api/employee/v1/dashboard/employee-summary`
- `GET /api/employee/v1/attendance/records`
- `POST /api/employee/v1/attendance/check-in`
- `POST /api/employee/v1/attendance/check-out`
- `GET /api/employee/v1/vacation-requests`
- `GET /api/employee/v1/vacation-requests/{id}`
- `POST /api/employee/v1/vacation-requests`
- `POST /api/employee/v1/vacation-requests/{id}/cancel`

## Estado PWA

El proyecto ya incluye:

- `manifest.webmanifest`
- iconos base
- metadatos móviles en `index.html`

Pendiente para una PWA completa:

- integrar `@angular/service-worker`
- definir estrategia offline/cache
- validar instalación real en dispositivo

## Validación manual

Checklist recomendado:

- [MANUAL_TEST_CHECKLIST.md](</C:/Repo/Angular/nexoEmployeePanel/MANUAL_TEST_CHECKLIST.md>)
