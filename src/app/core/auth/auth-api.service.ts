import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { AuthChangePasswordRequest } from './models/auth-change-password-request.model';
import { AuthDeleteAccountRequest } from './models/auth-delete-account-request.model';
import { AuthLoginRequest } from './models/auth-login-request.model';
import { AuthLoginResponse } from './models/auth-login-response.model';
import { AuthRefreshRequest } from './models/auth-refresh-request.model';
import { AuthTokenResponse } from './models/auth-token-response.model';
import { CurrentUser } from './models/current-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly resource = `${environment.apiBaseUrl}/api/auth/v1/auth`;

  login(request: AuthLoginRequest): Observable<ApiResponse<AuthLoginResponse>> {
    return this.http.post<ApiResponse<AuthLoginResponse>>(`${this.resource}/login`, request);
  }

  refresh(request: AuthRefreshRequest): Observable<ApiResponse<AuthTokenResponse>> {
    return this.http.post<ApiResponse<AuthTokenResponse>>(`${this.resource}/refresh`, request);
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.resource}/logout`, {});
  }

  changePassword(request: AuthChangePasswordRequest): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.resource}/password`, request);
  }

  me(): Observable<ApiResponse<CurrentUser>> {
    return this.http.get<ApiResponse<CurrentUser>>(`${this.resource}/me`);
  }

  deleteCurrentAccount(request: AuthDeleteAccountRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.apiBaseUrl}/api/employee/v1/profile/delete-account`,
      request
    );
  }
}
