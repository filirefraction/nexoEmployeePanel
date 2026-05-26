import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  AttendanceCheckInRequest,
  AttendanceCheckOutRequest,
  AttendanceRecord,
  AttendanceRecordFilter,
  AttendanceRecordListItem
} from '../models/attendance-record.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeAttendanceApiService {
  private readonly http = inject(HttpClient);
  private readonly resource = `${environment.apiBaseUrl}/api/employee/v1/attendance`;

  getRecords(
    filter: AttendanceRecordFilter
  ): Observable<ApiResponse<readonly AttendanceRecordListItem[]>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize);

    if (filter.fromDate) {
      params = params.set('fromDate', filter.fromDate);
    }

    if (filter.toDate) {
      params = params.set('toDate', filter.toDate);
    }

    if (typeof filter.isManual === 'boolean') {
      params = params.set('isManual', filter.isManual);
    }

    return this.http.get<ApiResponse<readonly AttendanceRecordListItem[]>>(
      `${this.resource}/records`,
      { params }
    );
  }

  checkIn(request: AttendanceCheckInRequest): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.resource}/check-in`, request);
  }

  checkOut(request: AttendanceCheckOutRequest): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.resource}/check-out`, request);
  }
}
