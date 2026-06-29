import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { EmployeeProfile } from '../models/employee-profile.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly resource = `${environment.apiBaseUrl}/api/employee/v1/profile`;

  getProfile(): Observable<ApiResponse<EmployeeProfile>> {
    return this.http.get<ApiResponse<EmployeeProfile>>(this.resource);
  }
}
