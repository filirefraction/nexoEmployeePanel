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
        message: fallbackMessage,
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
      message: apiError?.message || this.getStatusMessage(error.status, fallbackMessage),
      errors: apiError?.errors ?? [],
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
        return fallbackMessage;
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
}
