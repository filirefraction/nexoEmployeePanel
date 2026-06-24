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
  readonly latestKnownRecord = computed(() => this.buildLatestKnownRecord());
  readonly canCheckIn = computed(() => {
    const latestRecord = this.latestKnownRecord();

    if (!latestRecord) {
      return true;
    }

    return !latestRecord.hasCheckIn || latestRecord.hasCheckOut;
  });
  readonly canCheckOut = computed(() => {
    const latestRecord = this.latestKnownRecord();
    return !!latestRecord?.hasCheckIn && !latestRecord.hasCheckOut;
  });
  readonly attendanceStatusLabel = computed(() => {
    const latestRecord = this.latestKnownRecord();

    if (!latestRecord) {
      return 'Sin jornada abierta';
    }

    if (latestRecord.hasCheckIn && !latestRecord.hasCheckOut) {
      return 'Jornada abierta';
    }

    return 'Jornada cerrada';
  });
  readonly attendanceActionHint = computed(() => {
    if (this.canCheckOut()) {
      return 'Ya tienes una entrada abierta. El siguiente movimiento valido es registrar tu salida.';
    }

    if (this.canCheckIn()) {
      return 'Puedes registrar tu entrada. El sistema valida automaticamente el dia y evita duplicados.';
    }

    return 'Ya registraste tus movimientos disponibles para el dia operativo actual.';
  });

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
    this.runAction('Entrada registrada correctamente.', () => this.api.checkIn(request));
  }

  checkOut(request: AttendanceCheckOutRequest): void {
    this.runAction('Salida registrada correctamente.', () => this.api.checkOut(request));
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

  private buildLatestKnownRecord(): AttendanceRecord | null {
    const latestActionRecord = this.latestActionRecordState();

    if (latestActionRecord) {
      return latestActionRecord;
    }

    const latestListedRecord = this.recordsState()[0];

    if (!latestListedRecord) {
      return null;
    }

    return {
      ...latestListedRecord,
      hasCheckIn: !!latestListedRecord.checkInDate,
      hasCheckOut: !!latestListedRecord.checkOutDate
    };
  }
}
