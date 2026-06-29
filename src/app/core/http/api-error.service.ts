import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ApiErrorDetails {
  readonly statusCode: number;
  readonly message: string;
  readonly errors: readonly string[];
  readonly correlationId?: string;
  readonly errorCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiErrorService {
  toDetails(error: unknown, fallbackMessage = 'Ocurrio un error inesperado.'): ApiErrorDetails {
    if (!(error instanceof HttpErrorResponse)) {
      return {
        statusCode: 0,
        message: this.translateMessage(fallbackMessage),
        errors: []
      };
    }

    const apiError = error.error as
      | {
          message?: string;
          errors?: string[];
          correlationId?: string;
          errorCode?: string;
        }
      | undefined;

    return {
      statusCode: error.status,
      message: this.translateMessage(apiError?.message || this.getStatusMessage(error.status, fallbackMessage)),
      errors: (apiError?.errors ?? []).map((item) => this.translateMessage(item)),
      correlationId: apiError?.correlationId,
      errorCode: apiError?.errorCode
    };
  }

  getDisplayMessage(error: unknown, fallbackMessage = 'Ocurrio un error inesperado.'): string {
    const details = this.toDetails(error, fallbackMessage);
    const message = details.errors[0] ?? details.message;
    return details.errorCode ? `${message} Codigo: ${details.errorCode}` : message;
  }

  private getStatusMessage(statusCode: number, fallbackMessage: string): string {
    switch (statusCode) {
      case 0:
        return 'No fue posible conectar con el servidor. Verifica que la API este disponible.';
      case 401:
        return 'Tu sesion expiro o ya no es valida.';
      case 403:
        return 'Tu cuenta no tiene acceso a este portal.';
      case 404:
        return 'No fue posible encontrar el recurso solicitado.';
      case 409:
        return 'La operacion no pudo completarse por un conflicto de datos.';
      case 429:
        return 'Se excedio el limite de solicitudes. Espera unos segundos e intenta nuevamente.';
      default:
        if (statusCode >= 500) {
          return 'Ocurrio un error inesperado en el servidor.';
        }

        return fallbackMessage;
    }
  }

  private translateMessage(message: string): string {
    const normalizedMessage = message.trim();

    if (!normalizedMessage) {
      return normalizedMessage;
    }

    const translations: Record<string, string> = {
      'Invalid email or password.': 'Correo o contrasena incorrectos.',
      'Validation error.': 'Error de validacion.',
      'Ya existe un check-in abierto para el empleado actual.':
        'Ya tienes una jornada abierta. Debes registrar tu salida antes de volver a iniciar.',
      'Ya existe un check-in registrado para el dia actual.':
        'Ya registraste tu entrada para el dia operativo actual.',
      'Ya existe un check-out registrado para el dia actual.':
        'Ya registraste tu salida para el dia operativo actual.',
      'Only pending vacation requests can perform this action.':
        'Solo las solicitudes pendientes pueden realizar esta accion.',
      'The authenticated user is not linked to an active employee.':
        'Tu cuenta no esta vinculada a un empleado activo.',
      'The authenticated user is not linked to a valid employee.':
        'Tu cuenta no esta vinculada a un empleado valido para este portal.',
      'No open attendance record was found for the current employee.':
        'No se encontro una asistencia abierta para el empleado actual.',
      'No se encontro un check-in abierto para el empleado actual.':
        'No tienes una jornada abierta para registrar salida.',
      'Attendance is not required for this employee.':
        'La asistencia no es obligatoria para este empleado.',
      'The employee already has an open attendance record.':
        'El empleado ya tiene una asistencia abierta.',
      'Vacation requests are disabled for the current company.':
        'Las solicitudes de vacaciones estan deshabilitadas para la empresa actual.',
      'Request completed successfully.': 'La solicitud se completo correctamente.',
      'El empleado no tiene una sucursal asignada para validar la geocerca de asistencia.':
        'No tienes una sucursal asignada para validar tu asistencia. Solicita apoyo a un administrador.',
      'La sucursal asignada no tiene configuradas la latitud, longitud y el radio permitido para validar la asistencia.':
        'Tu sucursal no tiene configurada la geocerca de asistencia. Solicita apoyo a un administrador.',
      'La empresa requiere ubicacion GPS para registrar asistencia.':
        'Tu empresa requiere ubicacion GPS para registrar asistencia.',
      'La ubicacion del registro esta fuera del radio permitido de la sucursal.':
        'Tu ubicacion esta fuera del radio permitido de la sucursal.'
    };

    return translations[normalizedMessage] ?? normalizedMessage;
  }
}
