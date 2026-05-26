# MANUAL_TEST_CHECKLIST

## Objetivo

Validar funcionalmente `nexoEmployeePanel` contra `nexoApi`.

## Precondiciones

- `nexoApi` corriendo en `http://localhost:5031`
- `nexoEmployeePanel` corriendo en `http://localhost:4200`
- usuario con rol `employee`
- usuario con `employeeId` válido
- datos demo en asistencia y vacaciones si se quiere probar historial

## 1. Auth

### Login correcto

- abrir `/login`
- capturar credenciales válidas
- verificar redirección a `/app/inicio`

Esperado:

- sesión creada
- shell autenticado visible
- nombre del usuario en header

### Login inválido

- capturar password incorrecto

Esperado:

- error claro en español
- no entrar al shell

### Refresh token

- iniciar sesión
- esperar expiración del access token
- navegar a una ruta protegida

Esperado:

- refresh silencioso
- request original recuperada
- no expulsar al usuario

### Sesión expirada

- invalidar refresh token o dejar que falle
- navegar a una ruta protegida

Esperado:

- limpiar sesión
- abrir `/session-expired`

## 2. Dashboard

- abrir `/app/inicio`

Esperado:

- carga de `employee-summary`
- nombre del empleado
- puesto/sucursal
- estado actual de asistencia
- resumen de vacaciones
- asistencias recientes
- incidencias recientes

## 3. Attendance

- abrir `/app/asistencia`
- probar `check-in`
- probar `check-out`
- aplicar filtros por fecha
- navegar entre páginas si hay más de una

Esperado:

- mensajes claros de éxito/error
- historial actualizado
- manejo correcto de `409` y `429`

## 4. Vacations

- abrir `/app/vacaciones`
- crear una solicitud nueva
- consultar detalle
- cancelar una solicitud pendiente
- aplicar filtros por fecha

Esperado:

- creación correcta
- detalle correcto
- cancelación solo en solicitudes pendientes
- mensajes claros de negocio

## 5. Perfil

- abrir `/app/perfil`

Esperado:

- datos cargados desde `employee-summary`
- modo solo lectura explícito
- no mostrar controles de edición inexistentes

## 6. Guards

### Usuario no autenticado

- abrir `/app/inicio` sin sesión

Esperado:

- redirigir a `/login`
- incluir `returnUrl`

### Usuario autenticado incompatible

- usar cuenta sin `employeeId` o sin rol `employee`

Esperado:

- no entrar al portal
- mostrar `/app/access-denied`

## 7. Móvil/PWA base

- revisar en viewport móvil
- validar `manifest.webmanifest`
- validar iconos y `theme-color`

Esperado:

- navegación inferior usable
- layout estable en móvil

## 8. Resultado

Marcar por módulo:

- `OK`
- `Observación`
- `Bug`

Registrar además:

- request afectada
- respuesta HTTP
- `correlationId` si aplica
