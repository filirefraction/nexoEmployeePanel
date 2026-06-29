import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
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
import { EmployeeProfileSummary } from '../../../dashboard/models/employee-summary.model';
import { EmployeeAttendanceFacade } from '../../facades/employee-attendance.facade';
import { AttendanceCheckInRequest, AttendanceRecordListItem } from '../../models/attendance-record.model';

const ALLOWED_CHECK_IN_PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_CHECK_IN_PHOTO_BYTES = 5 * 1024 * 1024;

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
  @ViewChild('checkInPhotoInput')
  private readonly checkInPhotoInput?: ElementRef<HTMLInputElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly session = inject(CurrentSessionService);
  protected readonly attendance = inject(EmployeeAttendanceFacade);
  protected readonly dashboard = inject(EmployeeDashboardFacade);

  private readonly locationErrorState = signal<string | null>(null);
  private readonly gpsActionState = signal<'check-in' | 'check-out' | null>(null);
  private readonly pendingCheckInRequestState = signal<AttendanceCheckInRequest | null>(null);

  protected readonly filterForm = this.formBuilder.group({
    fromDate: this.formBuilder.control<Date | null>(null),
    toDate: this.formBuilder.control<Date | null>(null),
    isManual: this.formBuilder.nonNullable.control<string>('')
  });
  protected readonly manualFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Registros automaticos', value: 'false' },
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
  protected readonly locationErrorMessage = computed(() => this.locationErrorState());
  protected readonly isDashboardLoading = this.dashboard.isLoading;
  protected readonly attendancePolicy = computed(() => this.dashboard.summary()?.employee ?? null);
  protected readonly hasPendingCheckInPhoto = computed(() => !!this.pendingCheckInRequestState());
  protected readonly gpsHint = computed(() => {
    const policy = this.attendancePolicy();

    if (!policy?.companyRequireGps) {
      return null;
    }

    return policy.isRemoteAllowed || policy.companyAllowRemoteAttendance
      ? 'Se validara tu ubicacion.'
      : 'Se validara la geocerca de tu sucursal.';
  });
  protected readonly photoHint = computed(() => {
    const policy = this.attendancePolicy();

    if (!policy?.companyRequirePhoto) {
      return null;
    }

    if (!policy.isRemoteAllowed && !policy.companyAllowRemoteAttendance) {
      return null;
    }

    return 'Si el registro es remoto, despues deberas subir una foto.';
  });
  protected readonly pendingPhotoHint = computed(() => {
    if (!this.hasPendingCheckInPhoto()) {
      return null;
    }

    return 'Paso 2: sube tu foto para completar la entrada.';
  });
  protected readonly isCheckInBusy = computed(() => {
    return this.isActionInFlight() || this.gpsActionState() === 'check-in';
  });
  protected readonly isCheckOutBusy = computed(() => {
    return this.isActionInFlight() || this.gpsActionState() === 'check-out';
  });
  protected readonly primaryActionLabel = computed(() => {
    if (this.canCheckOut()) {
      return 'Registrar salida';
    }

    return 'Registrar entrada';
  });
  protected readonly primaryActionBusy = computed(() => {
    if (this.canCheckOut()) {
      return this.isCheckOutBusy();
    }

    return this.isCheckInBusy();
  });
  protected readonly primaryActionDisabled = computed(() => {
    if (this.hasPendingCheckInPhoto()) {
      return true;
    }

    if (this.canCheckOut()) {
      return this.isCheckInBusy() || this.isCheckOutBusy() || !this.canCheckOut();
    }

    return this.isCheckInBusy() || this.isCheckOutBusy() || !this.canCheckIn();
  });
  protected readonly primaryActionSupportText = computed(() => {
    if (this.hasPendingCheckInPhoto()) {
      return this.pendingPhotoHint();
    }

    if (this.canCheckOut()) {
      return 'Cierra tu jornada actual.';
    }

    if (this.canCheckIn()) {
      return 'Inicia tu jornada.';
    }

    return 'No hay una accion disponible en este momento.';
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

    if (!pagination || pageNumber < 1 || pageNumber > pagination.pageCount) {
      return;
    }

    this.attendance.load({ pageNumber });
  }

  protected async submitPrimaryAction(): Promise<void> {
    if (this.canCheckOut()) {
      await this.executeAttendanceAction('check-out');
      return;
    }

    await this.executeAttendanceAction('check-in');
  }

  protected openPendingCheckInPhotoPicker(): void {
    this.locationErrorState.set(null);
    this.triggerCheckInPhotoSelection();
  }

  protected cancelPendingCheckInPhoto(): void {
    this.pendingCheckInRequestState.set(null);
    this.locationErrorState.set('Se cancelo el registro de entrada porque no se adjunto la foto requerida.');
  }

  protected handleCheckInPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    const pendingRequest = this.pendingCheckInRequestState();

    if (!pendingRequest) {
      if (input) {
        input.value = '';
      }
      return;
    }

    if (!file) {
      this.locationErrorState.set('No se selecciono ninguna foto. Vuelve a intentarlo o cancela la operacion.');
      if (input) {
        input.value = '';
      }
      return;
    }

    const photoValidationError = this.validateCheckInPhoto(file);
    if (photoValidationError) {
      this.locationErrorState.set(photoValidationError);
      if (input) {
        input.value = '';
      }
      return;
    }

    this.pendingCheckInRequestState.set(null);
    this.attendance.checkIn(pendingRequest, file);

    if (input) {
      input.value = '';
    }
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
        const request: AttendanceCheckInRequest = {
          source: 'web',
          observation: null,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null
        };

        if (this.shouldRequireRemotePhoto(location)) {
          this.pendingCheckInRequestState.set(request);
          return;
        }

        this.attendance.checkIn(request);
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
        'Estamos cargando tu configuracion de asistencia. Intenta nuevamente en unos segundos.'
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

  private shouldRequireRemotePhoto(location: CoordinatesPayload | null): boolean {
    const policy = this.attendancePolicy();

    if (!policy?.companyRequirePhoto) {
      return false;
    }

    return this.isRemoteAttendance(policy, location);
  }

  private isRemoteAttendance(
    policy: EmployeeProfileSummary,
    location: CoordinatesPayload | null
  ): boolean {
    if (!policy.companyAllowRemoteAttendance && !policy.isRemoteAllowed) {
      return false;
    }

    if (!policy.companyRequireGps) {
      return true;
    }

    if (!location) {
      return true;
    }

    if (
      typeof policy.branchLatitude !== 'number' ||
      typeof policy.branchLongitude !== 'number' ||
      typeof policy.branchAllowedRadiusMeters !== 'number' ||
      policy.branchAllowedRadiusMeters <= 0
    ) {
      return true;
    }

    const distance = this.calculateDistanceInMeters(
      policy.branchLatitude,
      policy.branchLongitude,
      location.latitude,
      location.longitude
    );

    return distance > policy.branchAllowedRadiusMeters;
  }

  private triggerCheckInPhotoSelection(): void {
    const input = this.checkInPhotoInput?.nativeElement;

    if (!input) {
      this.pendingCheckInRequestState.set(null);
      this.locationErrorState.set(
        'No fue posible abrir la camara o el selector de archivos para capturar tu foto.'
      );
      return;
    }

    input.value = '';
    input.click();
  }

  private validateCheckInPhoto(file: File): string | null {
    if (file.size <= 0) {
      return 'La foto de asistencia esta vacia.';
    }

    if (file.size > MAX_CHECK_IN_PHOTO_BYTES) {
      return 'La foto de asistencia excede el tamano maximo permitido de 5 MB.';
    }

    const extension = this.getFileExtension(file.name);
    if (!extension || !ALLOWED_CHECK_IN_PHOTO_EXTENSIONS.includes(extension)) {
      return 'La extension del archivo de la foto de asistencia no esta permitida.';
    }

    if (file.type && !file.type.startsWith('image/')) {
      return 'El archivo seleccionado no es una imagen valida para la foto de asistencia.';
    }

    return null;
  }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : '';
  }

  private consumeDashboardAction(): void {
    const action = this.route.snapshot.queryParamMap.get('action');

    if (action === 'check-in') {
      void this.submitPrimaryAction();
      this.clearDashboardAction();
      return;
    }

    if (action === 'check-out') {
      void this.submitPrimaryAction();
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
      return 'Tu navegador no permite obtener la ubicacion. Usa un navegador compatible para registrar asistencia.';
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
        return 'Necesitamos acceso a tu ubicacion para registrar asistencia. Permite el GPS del navegador y vuelve a intentarlo.';
      case 2:
        return 'No fue posible obtener tu ubicacion actual. Verifica que el GPS este activo e intentalo nuevamente.';
      case 3:
        return 'La ubicacion tardo demasiado en responder. Verifica la senal del GPS e intentalo nuevamente.';
      default:
        return 'No fue posible obtener tu ubicacion. Intentalo nuevamente.';
    }
  }

  private calculateDistanceInMeters(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number
  ): number {
    const earthRadius = 6371000;
    const latitudeDelta = this.degreesToRadians(latitude2 - latitude1);
    const longitudeDelta = this.degreesToRadians(longitude2 - longitude1);

    const a =
      Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
      Math.cos(this.degreesToRadians(latitude1)) * Math.cos(this.degreesToRadians(latitude2)) *
      Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  private degreesToRadians(value: number): number {
    return value * Math.PI / 180;
  }
}

interface CoordinatesPayload {
  readonly latitude: number;
  readonly longitude: number;
}
