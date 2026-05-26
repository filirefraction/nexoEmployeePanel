import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import { AuthApiService } from '../auth/auth-api.service';
import { AuthLoginRequest } from '../auth/models/auth-login-request.model';
import { AuthTokenResponse } from '../auth/models/auth-token-response.model';
import { CurrentUser } from '../auth/models/current-user.model';
import { AuthTokenStoreService } from './auth-token-store.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentSessionService {
  private readonly injector = inject(Injector);
  private readonly tokenStore = inject(AuthTokenStoreService);
  private readonly router = inject(Router);

  private readonly currentUserState = signal<CurrentUser | null>(null);
  private readonly initializingState = signal(true);
  private refreshRequest$?: Observable<void>;

  readonly currentUser = computed(() => this.currentUserState());
  readonly isInitializing = computed(() => this.initializingState());
  readonly isAuthenticated = computed(() => this.currentUserState() !== null);
  readonly displayName = computed(() => this.currentUserState()?.displayName ?? 'Empleado');
  readonly roles = computed(() => this.currentUserState()?.roles ?? []);
  readonly permissions = computed(() => this.currentUserState()?.permissions ?? []);
  readonly employeeId = computed(() => this.currentUserState()?.employeeId ?? null);
  readonly isPortalCompatible = computed(() => {
    return this.isUserPortalCompatible(this.currentUserState());
  });

  async initialize(): Promise<void> {
    if (!this.tokenStore.getAccessToken() && !this.tokenStore.hasRefreshToken()) {
      this.initializingState.set(false);
      return;
    }

    try {
      await firstValueFrom(this.restoreSession());
    } finally {
      this.initializingState.set(false);
    }
  }

  login(request: AuthLoginRequest): Observable<CurrentUser> {
    return this.authApi.login(request).pipe(
      tap((response) => this.establishSession(response.data)),
      map((response) => response.data.user)
    );
  }

  logout(): Observable<void> {
    return this.authApi.logout().pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.clearSession()),
      tap(() => void this.router.navigate(['/login']))
    );
  }

  forceLogoutToLogin(reason: 'session-expired' | 'manual' = 'session-expired'): void {
    this.clearSession();
    void this.router.navigate([reason === 'session-expired' ? '/session-expired' : '/login']);
  }

  rejectIncompatibleSession(): void {
    this.clearSession();
    void this.router.navigate(['/access-denied']);
  }

  getAccessToken(): string | null {
    return this.tokenStore.getAccessToken();
  }

  hasRefreshToken(): boolean {
    return this.tokenStore.hasRefreshToken();
  }

  isUserPortalCompatible(user: CurrentUser | null | undefined): boolean {
    return Boolean(user && user.isActive && user.employeeId && user.roles.includes('employee'));
  }

  refreshSession(): Observable<void> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refreshToken = this.tokenStore.getRefreshToken();

    if (!refreshToken) {
      this.clearSession();
      return of(void 0);
    }

    this.refreshRequest$ = this.authApi
      .refresh({ refreshToken })
      .pipe(
        tap((response) => this.establishSession(response.data)),
        map(() => void 0),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = undefined;
        }),
        shareReplay(1)
      );

    return this.refreshRequest$;
  }

  private restoreSession(): Observable<void> {
    return this.authApi.me().pipe(
      tap((response) => {
        if (this.isUserPortalCompatible(response.data)) {
          this.currentUserState.set(response.data);
          return;
        }

        this.clearSession();
      }),
      map(() => void 0),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401 && this.hasRefreshToken()) {
          return this.refreshSession().pipe(
            switchMap(() => this.authApi.me()),
            tap((response) => {
              if (this.isUserPortalCompatible(response.data)) {
                this.currentUserState.set(response.data);
                return;
              }

              this.clearSession();
            }),
            map(() => void 0),
            catchError(() => {
              this.clearSession();
              return of(void 0);
            })
          );
        }

        this.clearSession();
        return of(void 0);
      })
    );
  }

  private establishSession(session: AuthTokenResponse): void {
    this.tokenStore.save({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAtUtc: session.accessTokenExpiresAtUtc,
      refreshTokenExpiresAtUtc: session.refreshTokenExpiresAtUtc
    });

    if (!this.isUserPortalCompatible(session.user)) {
      this.clearSession();
      return;
    }

    this.currentUserState.set(session.user);
  }

  private clearSession(): void {
    this.tokenStore.clear();
    this.currentUserState.set(null);
  }

  private get authApi(): AuthApiService {
    return this.injector.get(AuthApiService);
  }
}
