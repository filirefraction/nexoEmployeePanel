import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentSessionService } from '../session/current-session.service';

const AUTH_RETRY_CONTEXT = new HttpContextToken<boolean>(() => false);

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly session = inject(CurrentSessionService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const shouldAttachToken = this.shouldAttachToken(request.url);
    const accessToken = shouldAttachToken ? this.session.getAccessToken() : null;

    const authRequest =
      accessToken && shouldAttachToken
        ? request.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`
            }
          })
        : request;

    return next.handle(authRequest).pipe(
      catchError((error: unknown) => {
        if (!this.shouldAttemptRefresh(authRequest, error)) {
          return throwError(() => error);
        }

        return this.session.refreshSession().pipe(
          switchMap(() => {
            const refreshedAccessToken = this.session.getAccessToken();

            if (!refreshedAccessToken) {
              this.session.forceLogoutToLogin();
              return throwError(() => error);
            }

            return next.handle(
              authRequest.clone({
                context: authRequest.context.set(AUTH_RETRY_CONTEXT, true),
                setHeaders: {
                  Authorization: `Bearer ${refreshedAccessToken}`
                }
              })
            );
          }),
          catchError((refreshError) => {
            this.session.forceLogoutToLogin();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }

  private shouldAttachToken(url: string): boolean {
    return url.startsWith(environment.apiBaseUrl) && !this.isAnonymousRequest(url);
  }

  private isAnonymousRequest(url: string): boolean {
    return (
      url.endsWith('/api/auth/v1/auth/login') ||
      url.endsWith('/api/auth/v1/auth/refresh') ||
      url.endsWith('/health') ||
      url.endsWith('/health/ready')
    );
  }

  private shouldAttemptRefresh(request: HttpRequest<unknown>, error: unknown): boolean {
    return (
      error instanceof HttpErrorResponse &&
      error.status === 401 &&
      !request.context.get(AUTH_RETRY_CONTEXT) &&
      !this.isAnonymousRequest(request.url) &&
      this.session.hasRefreshToken()
    );
  }
}
