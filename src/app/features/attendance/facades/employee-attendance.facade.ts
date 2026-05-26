import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { PaginationMetadata } from '../../../shared/models/pagination.model';
import { EmployeeAttendanceApiService } from '../api/employee-attendance.api.service';
import {
  AttendanceCheckInRequest,
  AttendanceCheckOutRequest,
  AttendanceRecord,
  AttendanceRecordFilter,
  AttendanceRecordListItem
} from '../models/attendance-record.model';

const DEFAULT_FILTER: AttendanceRecordFilter = {
  pageNumber: 1,
  pageSize: 10,
  fromDate: null,
  toDate: null,
  isManual: null
};

@Injectable({
  providedIn: 'root'
})
export class EmployeeAttendanceFacade {
  private readonly api = inject(EmployeeAttendanceApiService);
  private readonly apiError = inject(ApiErrorService);

  private readonly recordsState = signal<readonly AttendanceRecordListItem[]>([]);
  private readonly paginationState = signal<PaginationMetadata | null>(null);
  private readonly filterState = signal<AttendanceRecordFilter>(DEFAULT_FILTER);
  private readonly loadingState = signal(false);
  private readonly actionState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly successState = signal<string | null>(null);
  private readonly latestActionRecordState = signal<AttendanceRecord | null>(null);

  readonly records = computed(() => this.recordsState());
  readonly pagination = computed(() => this.paginationState());
  readonly filter = computed(() => this.filterState());
  readonly isLoading = computed(() => this.loadingState());
  readonly isActionInFlight = computed(() => this.actionState());
  readonly errorMessage = computed(() => this.errorState());
  readonly successMessage = computed(() => this.successState());
  readonly latestActionRecord = computed(() => this.latestActionRecordState());

  load(filterPatch?: Partial<AttendanceRecordFilter>): void {
    const nextFilter = {
      ...this.filterState(),
      ...filterPatch
    };

    this.filterState.set(nextFilter);
    this.loadingState.set(true);
    this.errorState.set(null);

    this.api
      .getRecords(nextFilter)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.recordsState.set(response.data);
          this.paginationState.set(response.pagination ?? null);
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible cargar tu historial de asistencia.')
          );
        }
      });
  }

  checkIn(request: AttendanceCheckInRequest): void {
    this.runAction('Check-in registrado correctamente.', () => this.api.checkIn(request));
  }

  checkOut(request: AttendanceCheckOutRequest): void {
    this.runAction('Check-out registrado correctamente.', () => this.api.checkOut(request));
  }

  clearAlerts(): void {
    this.errorState.set(null);
    this.successState.set(null);
  }

  private runAction(
    successMessage: string,
    operation: () => ReturnType<EmployeeAttendanceApiService['checkIn']>
  ): void {
    if (this.actionState()) {
      return;
    }

    this.actionState.set(true);
    this.errorState.set(null);
    this.successState.set(null);

    operation()
      .pipe(finalize(() => this.actionState.set(false)))
      .subscribe({
        next: (response) => {
          this.latestActionRecordState.set(response.data);
          this.successState.set(successMessage);
          this.load();
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible completar la operación de asistencia.')
          );
        }
      });
  }
}
