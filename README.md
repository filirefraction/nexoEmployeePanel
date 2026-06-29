# nexoEmployeePanel

Portal web del empleado para `Nexo`, construido en Angular 21 con enfoque mobile-first y base PWA.

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
- sesion y guards por compatibilidad de portal empleado
- dashboard conectado a `employee-summary`
- attendance:
  - historial propio
  - check-in
  - check-out
- vacations:
  - listado propio
  - detalle
  - creacion
  - cancelacion
- perfil propio en modo solo lectura
  - con carga dedicada desde `GET /api/employee/v1/profile`
- pantallas de sistema:
  - acceso restringido
  - sesion expirada
  - not found
- base PWA:
  - `manifest.webmanifest`
  - `@angular/service-worker`
  - prompt de instalacion
  - prompt de actualizacion
  - banner offline

## Comandos utiles

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

Build + host local para validar PWA real:

```powershell
npm.cmd run qa:pwa
```

Servir la ultima build generada en `http://127.0.0.1:4301`:

```powershell
npm.cmd run serve:pwa
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
- `GET /api/employee/v1/profile`
- `GET /api/employee/v1/vacation-requests`
- `GET /api/employee/v1/vacation-requests/{id}`
- `POST /api/employee/v1/vacation-requests`
- `POST /api/employee/v1/vacation-requests/{id}/cancel`

## Estado PWA

El proyecto ya incluye:

- `manifest.webmanifest`
- iconos base
- metadatos moviles en `index.html`
- `ngsw-config.json`
- service worker habilitado solo en produccion
- host local de QA en `scripts/serve-pwa.mjs`

Importante:

- `ng serve` no valida service worker real
- para pruebas PWA usar `npm.cmd run qa:pwa` o `npm.cmd run serve:pwa`
- el host local recomendado para QA es `http://127.0.0.1:4301`

## Decision UI vigente

La decision base del portal empleado es:

- usar `Tailwind CSS` como sistema principal de layout y responsividad
- usar `PrimeNG` de forma selectiva para inputs, selects, datepickers y feedback
- evitar replicar patrones visuales del admin panel

Esto significa:

- shell movil propio
- navegacion compacta
- vistas tipo app
- listas y cards en lugar de tablas como patron dominante
- tema light y controles compactos

## Estado de fases

Estado actual:

1. Fase 1 UI base: cerrada
2. Fase 2 PWA base: cerrada
3. Fase 3 optimizacion de bundle inicial: cerrada
4. Fase 4 QA/manual PWA: lista para ejecucion

Siguiente fase natural:

- ejecutar ronda QA real en movil/PWA
- registrar bugs funcionales o visuales
- despues seguir con refinamientos por modulo

## Validacion manual

Checklist recomendado:

- [MANUAL_TEST_CHECKLIST.md](</C:/Repo/Angular/nexoEmployeePanel/MANUAL_TEST_CHECKLIST.md>)
