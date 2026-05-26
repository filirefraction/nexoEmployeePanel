# AGENTS.md

## Propósito

Este repositorio (`nexoEmployeePanel`) debe usar como base obligatoria de contexto la documentación compartida y específica ubicada en `C:\Repo\Docs\Nexo`.

Archivos principales para este proyecto:

- `C:\Repo\Docs\Nexo\shared\NEXO_ARCHITECTURE_CONTEXT.md`
- `C:\Repo\Docs\Nexo\shared\NEXO_BACKEND_BUSINESS_RULES_DOMAINS.md`
- `C:\Repo\Docs\Nexo\shared\NEXO_DATABASE_SCHEMA_SQL.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_BUSINESS_RULES.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_ARCHITECTURE_CONTEXT.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_IMPLEMENTATION_GUIDE.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_MODULES_AND_ROUTES.md`
- `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_OPENAPI_INTEGRATION.md`

Antes de proponer o implementar cambios, el agente debe identificar cuál de ellos aplica y usarlos en conjunto cuando la tarea lo requiera.

## Prioridad De Contexto

### 1. Reglas Funcionales Del Portal

Usar `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_BUSINESS_RULES.md` para:

- alcance funcional del portal empleado
- restricciones por rol `employee`
- reglas de attendance
- reglas de vacations
- reglas de perfil
- navegación esperada

### 2. Arquitectura Frontend

Usar `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_ARCHITECTURE_CONTEXT.md` para:

- estructura del frontend
- estrategia `core / features / shared`
- enfoque mobile-first y PWA
- organización vertical por feature
- uso de `signals` y fachadas

### 3. Convenciones De Implementación

Usar `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_IMPLEMENTATION_GUIDE.md` para:

- organización por feature
- formularios
- servicios HTTP
- estado local
- guards
- interceptores
- manejo de errores
- locale `es-MX`

### 4. Módulos Y Rutas

Usar `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_MODULES_AND_ROUTES.md` para:

- rutas públicas y autenticadas
- shell y navegación
- relación entre módulo y endpoint backend
- orden recomendado de implementación

### 5. Integración Con Backend

Usar `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_OPENAPI_INTEGRATION.md` para:

- auth y refresh
- endpoints reales del canal empleado
- `ApiResponse`
- `correlationId`
- manejo de `401`, `403`, `409`, `429`, `500`

### 6. Contexto Compartido

Usar estos archivos cuando la tarea lo requiera:

- `C:\Repo\Docs\Nexo\shared\NEXO_ARCHITECTURE_CONTEXT.md`
- `C:\Repo\Docs\Nexo\shared\NEXO_BACKEND_BUSINESS_RULES_DOMAINS.md`
- `C:\Repo\Docs\Nexo\shared\NEXO_DATABASE_SCHEMA_SQL.md`

Aplican para:

- entender el backend real
- validar dominios
- validar nombres y estructura de datos
- detectar contradicciones entre UI propuesta y sistema real

## Reglas Para Agentes

1. Antes de tocar arquitectura frontend, revisar `NEXO_EMPLOYEE_PANEL_ARCHITECTURE_CONTEXT.md`.
2. Antes de implementar comportamiento funcional, revisar `NEXO_EMPLOYEE_PANEL_BUSINESS_RULES.md`.
3. Antes de crear pantallas, componentes, servicios o estado, revisar `NEXO_EMPLOYEE_PANEL_IMPLEMENTATION_GUIDE.md`.
4. Antes de definir rutas o navegación, revisar `NEXO_EMPLOYEE_PANEL_MODULES_AND_ROUTES.md`.
5. Antes de integrar endpoints, revisar `NEXO_EMPLOYEE_PANEL_OPENAPI_INTEGRATION.md`.
6. Si la tarea depende del dominio o backend, complementar con los documentos de `shared`.
7. Si una propuesta contradice el contrato backend o reglas del dominio, señalarlo explícitamente antes de implementar.

## Orden Recomendado De Lectura

Para cambios estructurales:

1. `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_ARCHITECTURE_CONTEXT.md`
2. `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_IMPLEMENTATION_GUIDE.md`

Para cambios funcionales:

1. `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_BUSINESS_RULES.md`
2. `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_MODULES_AND_ROUTES.md`
3. `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_OPENAPI_INTEGRATION.md`

Para integración con backend:

1. `C:\Repo\Docs\Nexo\frontend\NEXO_EMPLOYEE_PANEL_OPENAPI_INTEGRATION.md`
2. `C:\Repo\Docs\Nexo\shared\NEXO_BACKEND_BUSINESS_RULES_DOMAINS.md`
3. `C:\Repo\Docs\Nexo\shared\NEXO_DATABASE_SCHEMA_SQL.md`

## Regla De Consistencia

Toda propuesta o implementación debe validar:

- ruta correcta
- feature correcto
- contrato backend correcto
- contexto de empleado correcto
- idioma y locale correctos (`es-MX`)
- experiencia móvil coherente

Si una implementación contradice alguno de los documentos de contexto, el agente debe:

1. señalar la contradicción
2. explicar el impacto
3. proponer el ajuste mínimo necesario
