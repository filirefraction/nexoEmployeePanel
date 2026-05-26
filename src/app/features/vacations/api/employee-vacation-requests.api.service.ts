import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  VacationRequest,
  VacationRequestCreateRequest,
  VacationRequestFilter,
  VacationRequestListItem
} from '../models/vacation-request.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeVacationRequestsApiService {
  private readonly http = inject(HttpClient);
  private readonly resource = `${environment.apiBaseUrl}/api/employee/v1/vacation-requests`;

  getRequests(filter: VacationRequestFilter): Observable<ApiResponse<readonly VacationRequestListItem[]>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize);

    if (filter.fromDate) {
      params = params.set('fromDate', filter.fromDate);
    }

    if (filter.toDate) {
      params = params.set('toDate', filter.toDate);
    }

    return this.http.get<ApiResponse<readonly VacationRequestListItem[]>>(this.resource, { params });
  }

  getById(id: string): Observable<ApiResponse<VacationRequest>> {
    return this.http.get<ApiResponse<VacationRequest>>(`${this.resource}/${id}`);
  }

  create(request: VacationRequestCreateRequest): Observable<ApiResponse<VacationRequest>> {
    return this.http.post<ApiResponse<VacationRequest>>(this.resource, request);
  }

  cancel(id: string): Observable<ApiResponse<VacationRequest>> {
    return this.http.post<ApiResponse<VacationRequest>>(`${this.resource}/${id}/cancel`, {});
  }
}
