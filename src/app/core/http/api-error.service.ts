import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ApiErrorDetails {
  readonly statusCode: number;
  readonly message: string;
  readonly errors: readonly string[];
  readonly correlationId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiErrorService {
  toDetails(error: unknown, fallbackMessage = 'Ocurrió un error inesperado.'): ApiErrorDetails {
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
        }
      | undefined;

    return {
      statusCode: error.status,
      message: this.translateMessage(apiError?.message || this.getStatusMessage(error.status, fallbackMessage)),
      errors: (apiError?.errors ?? []).map((item) => this.translateMessage(item)),
      correlationId: apiError?.correlationId
    };
  }

  getDisplayMessage(error: unknown, fallbackMessage = 'Ocurrió un error inesperado.'): string {
    const details = this.toDetails(error, fallbackMessage);
    const message = details.errors[0] ?? details.message;
    return details.correlationId ? `${message} Folio: ${details.correlationId}` : message;
  }

  private getStatusMessage(statusCode: number, fallbackMessage: string): string {
    switch (statusCode) {
      case 0:
        return 'No fue posible conectar con el servidor. Verifica que la API este disponible.';
      case 401:
        return 'Tu sesión expiró o ya no es válida.';
      case 403:
        return 'Tu cuenta no tiene acceso a este portal.';
      case 404:
        return 'No fue posible encontrar el recurso solicitado.';
      case 409:
        return 'La operación no pudo completarse por un conflicto de datos.';
      case 429:
        return 'Se excedió el límite de solicitudes. Espera unos segundos e intenta nuevamente.';
      default:
        if (statusCode >= 500) {
          return 'Ocurrió un error inesperado en el servidor.';
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
      'Only pending vacation requests can perform this action.':
        'Solo las solicitudes pendientes pueden realizar esta accion.',
      'The authenticated user is not linked to an active employee.':
        'Tu cuenta no esta vinculada a un empleado activo.',
      'The authenticated user is not linked to a valid employee.':
        'Tu cuenta no esta vinculada a un empleado valido para este portal.',
      'No open attendance record was found for the current employee.':
        'No se encontro una asistencia abierta para el empleado actual.',
      'Attendance is not required for this employee.':
        'La asistencia no es obligatoria para este empleado.',
      'The employee already has an open attendance record.':
        'El empleado ya tiene una asistencia abierta.',
      'Vacation requests are disabled for the current company.':
        'Las solicitudes de vacaciones estan deshabilitadas para la empresa actual.',
      'Request completed successfully.': 'La solicitud se completo correctamente.'
    };

    return translations[normalizedMessage] ?? normalizedMessage;
  }
}
