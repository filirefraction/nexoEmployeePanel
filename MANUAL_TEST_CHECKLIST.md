# MANUAL_TEST_CHECKLIST

## Objetivo

Validar funcionalmente `nexoEmployeePanel` contra `nexoApi`.

## Precondiciones

- `nexoApi` corriendo en `http://localhost:5031`
- `nexoEmployeePanel` corriendo en `http://localhost:4201`
- usuario con rol `employee`
- usuario con `employeeId` valido
- datos demo en asistencia y vacaciones si se quiere probar historial

## 1. Auth

### Login correcto

- abrir `/login`
- capturar credenciales validas
- verificar redireccion a `/app/inicio`
- si el correo existe en mas de una company, seleccionar la empresa antes de continuar

Esperado:

- sesion creada
- shell autenticado visible
- nombre del usuario en header

Resultado:

- `OK`

### Login invalido

- capturar password incorrecto

Esperado:

- error claro en espanol
- no entrar al shell

Resultado:

- `OK`

### Refresh token

- iniciar sesion
- esperar expiracion del access token
- navegar a una ruta protegida

Esperado:

- refresh silencioso
- request original recuperada
- no expulsar al usuario

Resultado:

- `OK`

### Sesion expirada

- invalidar refresh token o dejar que falle
- navegar a una ruta protegida

Esperado:

- limpiar sesion
- abrir `/session-expired`

Resultado:

- `OK`

Nota:

- apagar la API provoca error de red, no expiracion real de sesion
- `/session-expired` aplica cuando falla refresh o llega `401` real

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

Resultado:

- `OK`

Nota:

- los accesos rapidos de check-in/check-out se retiraron por ahora
- la operacion diaria queda centralizada en el modulo `Asistencia`

## 3. Attendance

- abrir `/app/asistencia`
- probar `check-in`
- probar `check-out`
- aplicar filtros por fecha
- navegar entre paginas si hay mas de una
- confirmar que la pantalla deshabilite la accion opuesta cuando ya exista jornada abierta o cerrada

Esperado:

- mensajes claros de exito/error
- historial actualizado
- manejo correcto de `409` y `429`

Resultado:

- `OK`

Nota:

- la UI interpreta timestamps UTC y los presenta usando `branch.timeZone`
- criterio replicado en `nexoAdminPanel/Asistencia` y `nexoAdminPanel/Reports`

## 4. Vacations

- abrir `/app/vacaciones`
- crear una solicitud nueva
- calcular vista previa antes de enviar
- consultar detalle
- cancelar una solicitud pendiente
- aplicar filtros por fecha

Esperado:

- creacion correcta
- preview correcto con:
  - periodo calculado
  - dias que cuentan y no cuentan
  - fecha estimada de regreso
- detalle correcto
- cancelacion solo en solicitudes pendientes
- mensajes claros de negocio

Resultado:

- `OK`

## 5. Perfil

- abrir `/app/perfil`

Esperado:

- datos cargados desde `employee-summary`
- modo solo lectura explicito
- no mostrar controles de edicion inexistentes

Resultado:

- `OK`

## 6. Guards

### Usuario no autenticado

- abrir `/app/inicio` sin sesion

Esperado:

- redirigir a `/login`
- incluir eturnUrl`

Resultado:

- `OK`

### Usuario autenticado incompatible

- usar cuenta sin `employeeId` o sin rol `employee`

Esperado:

- no entrar al portal
- mostrar acceso restringido
- no conservar tokens ni header autenticado del portal

Resultado:

- `OK`

## 7. Movil/PWA base

- revisar en viewport movil
- validar `manifest.webmanifest`
- validar iconos y `theme-color`

Esperado:

- navegacion inferior usable
- layout estable en movil

Resultado:

- `OK`

## 8. Resultado

Registrar ademas:

- request afectada
- respuesta HTTP
- `correlationId` si aplica

## Cierre

Estado final de esta ronda:

- `Auth`: `OK`
- `Dashboard`: `OK`
- `Attendance`: `OK`
- `Vacations`: `OK`
- `Perfil`: `OK`
- `Guards`: `OK`
- `Movil/PWA base`: `OK`
- `Ronda manual`: `CERRADA`


