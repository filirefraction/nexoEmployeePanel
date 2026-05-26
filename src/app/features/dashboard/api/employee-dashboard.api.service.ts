import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { EmployeeSummary } from '../models/employee-summary.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly resource = `${environment.apiBaseUrl}/api/employee/v1/dashboard`;

  getSummary(): Observable<ApiResponse<EmployeeSummary>> {
    return this.http.get<ApiResponse<EmployeeSummary>>(`${this.resource}/employee-summary`);
  }
}
