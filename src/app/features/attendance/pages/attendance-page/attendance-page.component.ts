import { NgFor, NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { CurrentSessionService } from '../../../../core/session/current-session.service';
import { EmployeeDashboardFacade } from '../../../dashboard/facades/employee-dashboard.facade';
import { EmployeeAttendanceFacade } from '../../facades/employee-attendance.facade';
import { AttendanceRecordListItem } from '../../models/attendance-record.model';

@Component({
  selector: 'app-attendance-page',
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    DatePickerModule,
    FloatLabelModule,
    MessageModule,
    SelectModule,
    TagModule
  ],
  templateUrl: './attendance-page.component.html',
})
export class AttendancePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly session = inject(CurrentSessionService);
  protected readonly attendance = inject(EmployeeAttendanceFacade);
  protected readonly dashboard = inject(EmployeeDashboardFacade);

  private readonly locationErrorState = signal<string | null>(null);
  private readonly gpsActionState = signal<'check-in' | 'check-out' | null>(null);

  protected readonly filterForm = this.formBuilder.group({
    fromDate: this.formBuilder.control<Date | null>(null),
    toDate: this.formBuilder.control<Date | null>(null),
    isManual: this.formBuilder.nonNullable.control<string>('')
  });
  protected readonly manualFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Registros automáticos', value: 'false' },
    { label: 'Registros manuales', value: 'true' }
  ];

  protected readonly records = this.attendance.records;
  protected readonly pagination = this.attendance.pagination;
  protected readonly isLoading = this.attendance.isLoading;
  protected readonly isActionInFlight = this.attendance.isActionInFlight;
  protected readonly errorMessage = this.attendance.errorMessage;
  protected readonly successMessage = this.attendance.successMessage;
  protected readonly latestActionRecord = this.attendance.latestActionRecord;
  protected readonly latestKnownRecord = this.attendance.latestKnownRecord;
  protected readonly canCheckIn = this.attendance.canCheckIn;
  protected readonly canCheckOut = this.attendance.canCheckOut;
  protected readonly attendanceStatusLabel = this.attendance.attendanceStatusLabel;
  protected readonly attendanceActionHint = this.attendance.attendanceActionHint;
  protected readonly locationErrorMessage = computed(() => this.locationErrorState());
  protected readonly isDashboardLoading = this.dashboard.isLoading;
  protected readonly attendancePolicy = computed(() => this.dashboard.summary()?.employee ?? null);
  protected readonly gpsHint = computed(() => {
    const policy = this.attendancePolicy();

    if (!policy?.companyRequireGps) {
      return null;
    }

    return policy.isRemoteAllowed || policy.companyAllowRemoteAttendance
      ? 'Se solicitará tu ubicación para registrar asistencia.'
      : 'Se solicitará tu ubicación para validar la geocerca de tu sucursal.';
  });
  protected readonly isCheckInBusy = computed(() => {
    return this.isActionInFlight() || this.gpsActionState() === 'check-in';
  });
  protected readonly isCheckOutBusy = computed(() => {
    return this.isActionInFlight() || this.gpsActionState() === 'check-out';
  });

  constructor() {
    this.attendance.load();

    if (!this.dashboard.summary() && !this.dashboard.isLoading()) {
      this.dashboard.load();
    }

    this.consumeDashboardAction();
  }

  protected applyFilters(): void {
    const value = this.filterForm.getRawValue();

    this.attendance.load({
      pageNumber: 1,
      fromDate: this.toApiDate(value.fromDate),
      toDate: this.toApiDate(value.toDate),
      isManual:
        value.isManual === ''
          ? null
          : value.isManual === 'true'
            ? true
            : false
    });
  }

  protected resetFilters(): void {
    this.filterForm.reset({
      fromDate: null,
      toDate: null,
      isManual: ''
    });
    this.attendance.load({
      pageNumber: 1,
      fromDate: null,
      toDate: null,
      isManual: null
    });
  }

  protected goToPage(pageNumber: number): void {
    const pagination = this.pagination();

    if (!pagination || pageNumber < 1 || pageNumber > pagination.totalPages) {
      return;
    }

    this.attendance.load({ pageNumber });
  }

  protected async submitCheckIn(): Promise<void> {
    await this.executeAttendanceAction('check-in');
  }

  protected async submitCheckOut(): Promise<void> {
    await this.executeAttendanceAction('check-out');
  }

  protected formatAttendanceDate(record: AttendanceRecordListItem): string {
    return this.formatDateOnly(record.attendanceDate, record.timeZone, {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  protected formatAttendanceTime(
    value: string | null | undefined,
    timeZone?: string | null
  ): string {
    if (!value) {
      return 'Sin registro';
    }

    return this.formatDateTime(value, timeZone, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  protected formatMinutes(totalMinutes: number | null | undefined): string {
    if (!totalMinutes || totalMinutes <= 0) {
      return '0 min';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (!hours) {
      return `${minutes} min`;
    }

    if (!minutes) {
      return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
  }

  protected resolveRecordStatus(record: AttendanceRecordListItem): string {
    if (!record.checkInDate) {
      return 'Sin entrada';
    }

    if (!record.checkOutDate) {
      return 'Abierta';
    }

    return 'Cerrada';
  }

  protected resolveRecordStatusSeverity(
    record: AttendanceRecordListItem
  ): 'success' | 'warn' | 'secondary' {
    if (!record.checkInDate) {
      return 'secondary';
    }

    if (!record.checkOutDate) {
      return 'warn';
    }

    return 'success';
  }

  private async executeAttendanceAction(action: 'check-in' | 'check-out'): Promise<void> {
    if (this.isActionInFlight() || this.gpsActionState()) {
      return;
    }

    this.locationErrorState.set(null);
    this.attendance.clearAlerts();
    this.gpsActionState.set(action);

    try {
      const location = await this.resolveAttendanceLocation();

      if (location === undefined) {
        return;
      }

      if (action === 'check-in') {
        this.attendance.checkIn({
          source: 'web',
          observation: null,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null
        });

        return;
      }

      this.attendance.checkOut({
        source: 'web',
        observation: null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null
      });
    } finally {
      this.gpsActionState.set(null);
    }
  }

  private async resolveAttendanceLocation(): Promise<CoordinatesPayload | null | undefined> {
    const policy = this.attendancePolicy();

    if (!policy) {
      if (!this.dashboard.isLoading()) {
        this.dashboard.load();
      }

      this.locationErrorState.set(
        'Estamos cargando tu configuración de asistencia. Intenta nuevamente en unos segundos.'
      );
      return undefined;
    }

    if (!policy.companyRequireGps) {
      return null;
    }

    try {
      return await this.getCurrentPosition();
    } catch (error) {
      this.locationErrorState.set(this.resolveGeolocationErrorMessage(error));
      return undefined;
    }
  }

  private consumeDashboardAction(): void {
    const action = this.route.snapshot.queryParamMap.get('action');

    if (action === 'check-in') {
      void this.submitCheckIn();
      this.clearDashboardAction();
      return;
    }

    if (action === 'check-out') {
      void this.submitCheckOut();
      this.clearDashboardAction();
    }
  }

  private clearDashboardAction(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        action: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private formatDateOnly(
    value: string,
    timeZone: string | null | undefined,
    options: Intl.DateTimeFormatOptions
  ): string {
    const safeDate = new Date(`${value}T12:00:00Z`);
    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone: this.resolveTimeZone(timeZone)
    }).format(safeDate);
  }

  private formatDateTime(
    value: string,
    timeZone: string | null | undefined,
    options: Intl.DateTimeFormatOptions
  ): string {
    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone: this.resolveTimeZone(timeZone)
    }).format(this.parseUtcDateTime(value));
  }

  private resolveTimeZone(timeZone: string | null | undefined): string {
    return timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private parseUtcDateTime(value: string): Date {
    const hasOffset = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
    return new Date(hasOffset ? value : `${value}Z`);
  }

  private toApiDate(value: Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getCurrentPosition(): Promise<CoordinatesPayload> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('unsupported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  }

  private resolveGeolocationErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message === 'unsupported') {
      return 'Tu navegador no permite obtener la ubicación. Usa un navegador compatible para registrar asistencia.';
    }

    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'number'
        ? (error as { code: number }).code
        : null;

    switch (code) {
      case 1:
        return 'Necesitamos acceso a tu ubicación para registrar asistencia. Permite el GPS del navegador y vuelve a intentarlo.';
      case 2:
        return 'No fue posible obtener tu ubicación actual. Verifica que el GPS esté activo e inténtalo nuevamente.';
      case 3:
        return 'La ubicación tardó demasiado en responder. Verifica la señal del GPS e inténtalo nuevamente.';
      default:
        return 'No fue posible obtener tu ubicación. Inténtalo nuevamente.';
    }
  }
}

interface CoordinatesPayload {
  readonly latitude: number;
  readonly longitude: number;
}
