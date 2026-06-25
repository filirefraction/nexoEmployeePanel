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

  checkInWithPhoto(
    request: AttendanceCheckInRequest,
    photo: File
  ): Observable<ApiResponse<AttendanceRecord>> {
    const formData = new FormData();
    formData.append('source', request.source);

    if (request.branchId) {
      formData.append('branchId', request.branchId);
    }

    if (typeof request.latitude === 'number') {
      formData.append('latitude', request.latitude.toString());
    }

    if (typeof request.longitude === 'number') {
      formData.append('longitude', request.longitude.toString());
    }

    if (request.observation) {
      formData.append('observation', request.observation);
    }

    formData.append('photo', photo, photo.name);

    return this.http.post<ApiResponse<AttendanceRecord>>(
      `${this.resource}/check-in-with-photo`,
      formData
    );
  }

  checkOut(request: AttendanceCheckOutRequest): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.resource}/check-out`, request);
  }
}
