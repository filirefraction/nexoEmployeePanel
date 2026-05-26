import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(environment.apiBaseUrl) || request.headers.has('X-Correlation-Id')) {
      return next.handle(request);
    }

    return next.handle(
      request.clone({
        setHeaders: {
          'X-Correlation-Id': this.generateCorrelationId()
        }
      })
    );
  }

  private generateCorrelationId(): string {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }
}
