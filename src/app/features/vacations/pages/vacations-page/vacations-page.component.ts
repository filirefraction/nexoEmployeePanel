import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { EmployeeDashboardApiService } from '../../../dashboard/api/employee-dashboard.api.service';
import { EmployeeVacationRequestsFacade } from '../../facades/employee-vacation-requests.facade';
import {
  VacationRequest,
  VacationRequestListItem,
  VacationRequestPreview,
  VacationRequestPreviewDay
} from '../../models/vacation-request.model';

const VACATION_REQUEST_STATUS_IDS = {
  pending: '0D3A16EE-7E16-4CA5-A15B-6097F61E9B01',
  approved: '1F1A71D8-6A4B-49CC-B4EF-804D285B7D02',
  rejected: 'B4C3EAB6-3A93-4C84-A5D2-4AF3E28B3903',
  canceled: '8A6D8D93-F0A0-4505-B1B2-69A2E04FBC04'
} as const;

@Component({
  selector: 'app-vacations-page',
  imports: [
    DatePipe,
    DecimalPipe,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    FloatLabelModule,
    InputNumberModule,
    MessageModule,
    TagModule,
    TextareaModule
  ],
  templateUrl: './vacations-page.component.html',
})
export class VacationsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly dashboardApi = inject(EmployeeDashboardApiService);
  protected readonly vacations = inject(EmployeeVacationRequestsFacade);
  protected readonly requestMinDate = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  })();

  protected readonly activeStep = signal(1);
  protected readonly isDetailDialogVisible = signal(false);
  private readonly closeDetailAfterCancelState = signal(false);
  protected readonly availableVacationDays = signal<number | null>(null);
  protected readonly hasAvailableVacationDays = computed(
    () => (this.availableVacationDays() ?? 0) > 0
  );

  protected readonly filterForm = this.formBuilder.group({
    fromDate: this.formBuilder.control<Date | null>(null),
    toDate: this.formBuilder.control<Date | null>(null)
  });

  protected readonly requestForm = this.formBuilder.group({
    fromDate: this.formBuilder.control<Date | null>(null, [Validators.required]),
    requestedDays: this.formBuilder.control<number | null>(1, [Validators.required, Validators.min(1)]),
    reason: this.formBuilder.nonNullable.control('', [Validators.maxLength(500)])
  });

  protected readonly requests = this.vacations.requests;
  protected readonly selectedRequest = this.vacations.selectedRequest;
  protected readonly pagination = this.vacations.pagination;
  protected readonly isLoading = this.vacations.isLoading;
  protected readonly isDetailLoading = this.vacations.isDetailLoading;
  protected readonly isActionInFlight = this.vacations.isActionInFlight;
  protected readonly isPreviewLoading = this.vacations.isPreviewLoading;
  protected readonly errorMessage = this.vacations.errorMessage;
  protected readonly successMessage = this.vacations.successMessage;
  protected readonly preview = this.vacations.preview;

  constructor() {
    this.vacations.load();
    this.loadAvailableVacationDays();

    effect(() => {
      const availableDays = this.availableVacationDays();
      const validators = [Validators.required, Validators.min(1)];

      if (availableDays !== null) {
        validators.push(Validators.max(availableDays));
      }

      this.requestForm.controls.requestedDays.setValidators(validators);
      this.requestForm.controls.requestedDays.updateValueAndValidity({ emitEvent: false });
    });

    this.requestForm.controls.fromDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.vacations.clearPreview();
        if (this.activeStep() === 2) {
          this.activeStep.set(1);
        }
      });

    this.requestForm.controls.requestedDays.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.vacations.clearPreview();
        if (this.activeStep() === 2) {
          this.activeStep.set(1);
        }
      });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (params.get('action') === 'new-request') {
          this.prepareNewRequestFlow();
        }
      });

    effect(() => {
      if (this.preview()) {
        this.activeStep.set(2);
      }
    });

    effect(() => {
      if (this.successMessage() === 'Solicitud enviada correctamente.') {
        this.loadAvailableVacationDays();
        this.requestForm.reset({
          fromDate: null,
          requestedDays: 1,
          reason: ''
        });
        this.activeStep.set(1);
      }
    });

    effect(() => {
      if (
        this.closeDetailAfterCancelState() &&
        this.successMessage() === 'Solicitud cancelada correctamente.'
      ) {
        this.closeDetailAfterCancelState.set(false);
        this.loadAvailableVacationDays();
        this.closeDetail();
      }
    });

    effect(() => {
      if (this.closeDetailAfterCancelState() && !!this.errorMessage()) {
        this.closeDetailAfterCancelState.set(false);
      }
    });
  }

  protected applyFilters(): void {
    const value = this.filterForm.getRawValue();
    this.vacations.load({
      pageNumber: 1,
      fromDate: this.toApiDate(value.fromDate),
      toDate: this.toApiDate(value.toDate)
    });
  }

  protected resetFilters(): void {
    this.filterForm.reset({
      fromDate: null,
      toDate: null
    });
    this.vacations.load({
      pageNumber: 1,
      fromDate: null,
      toDate: null
    });
  }

  protected submitRequest(): void {
    const preview = this.preview();

    if (this.requestForm.invalid || this.isActionInFlight() || !preview) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.getRawValue();

    this.vacations.create({
      fromDate: this.toApiDate(value.fromDate) ?? '',
      requestedDays: value.requestedDays ?? 0,
      reason: value.reason || null
    });
  }

  protected requestPreviewStep(): void {
    if (this.requestForm.invalid || this.isPreviewLoading()) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.getRawValue();

    this.vacations.previewRequest({
      fromDate: this.toApiDate(value.fromDate) ?? '',
      requestedDays: value.requestedDays ?? 0
    });
  }

  protected goToRequestStep(): void {
    this.activeStep.set(1);
  }

  protected viewRequest(id: string): void {
    this.isDetailDialogVisible.set(true);
    this.vacations.selectRequest(id);
  }

  protected closeDetail(): void {
    this.isDetailDialogVisible.set(false);
    this.vacations.clearSelection();
  }

  protected cancelSelected(): void {
    const selected = this.selectedRequest();

    if (!selected || !this.canCancel(selected)) {
      return;
    }

    this.closeDetailAfterCancelState.set(true);
    this.vacations.cancel(selected.id);
  }

  protected goToPage(pageNumber: number): void {
    const pagination = this.pagination();

    if (!pagination || pageNumber < 1 || pageNumber > pagination.pageCount) {
      return;
    }

    this.vacations.load({ pageNumber });
  }

  protected getStatusLabel(
    item:
      | Pick<VacationRequestListItem, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
      | Pick<VacationRequest, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
  ): string {
    switch (
      this.resolveVacationRequestStatusCode(
        item.vacationRequestStatusId,
        item.vacationRequestStatusName
      )
    ) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'canceled':
        return 'Cancelada';
      case 'pending':
      default:
        return 'Pendiente';
    }
  }

  protected getStatusSeverity(
    item:
      | Pick<VacationRequestListItem, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
      | Pick<VacationRequest, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
  ): 'success' | 'danger' | 'secondary' | 'warn' {
    switch (
      this.resolveVacationRequestStatusCode(
        item.vacationRequestStatusId,
        item.vacationRequestStatusName
      )
    ) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'canceled':
        return 'secondary';
      case 'pending':
      default:
        return 'warn';
    }
  }

  protected getPreviewCountedDays(preview: VacationRequestPreview): number {
    return preview.days.filter((day) => day.countsAsVacationDay).length;
  }

  protected getPreviewSkippedDays(preview: VacationRequestPreview): number {
    return preview.days.filter((day) => !day.countsAsVacationDay).length;
  }

  protected getRequestedDaysErrorMessage(): string {
    const control = this.requestForm.controls.requestedDays;

    if (control.errors?.['required'] || control.errors?.['min']) {
      return 'Ingresa al menos un día.';
    }

    if (control.errors?.['max']) {
      const availableDays = this.availableVacationDays();

      if (availableDays !== null) {
        return `No puedes solicitar más de ${availableDays} día(s) disponibles.`;
      }
    }

    return 'Valor inválido.';
  }

  protected getPreviewDayTagValue(day: { countsAsVacationDay: boolean }): string {
    return day.countsAsVacationDay ? 'Cuenta' : 'No cuenta';
  }

  protected getPreviewDayTagSeverity(day: { countsAsVacationDay: boolean }): 'success' | 'secondary' {
    return day.countsAsVacationDay ? 'success' : 'secondary';
  }

  private resolveVacationRequestStatusCode(
    statusId: string,
    statusName?: string
  ): 'approved' | 'rejected' | 'canceled' | 'pending' {
    switch (statusId.toUpperCase()) {
      case VACATION_REQUEST_STATUS_IDS.approved:
        return 'approved';
      case VACATION_REQUEST_STATUS_IDS.rejected:
        return 'rejected';
      case VACATION_REQUEST_STATUS_IDS.canceled:
        return 'canceled';
      case VACATION_REQUEST_STATUS_IDS.pending:
        return 'pending';
      default:
        switch ((statusName ?? '').toLowerCase()) {
          case 'approved':
            return 'approved';
          case 'rejected':
            return 'rejected';
          case 'canceled':
            return 'canceled';
          case 'pending':
          default:
            return 'pending';
        }
    }
  }

  protected canCancel(item: Pick<VacationRequest, 'canCancel'>): boolean {
    return item.canCancel;
  }

  protected resolvePreviewDayLabel(day: VacationRequestPreviewDay): string {
    switch (day.dayOfWeek.toLowerCase()) {
      case 'monday':
        return 'Lunes';
      case 'tuesday':
        return 'Martes';
      case 'wednesday':
        return 'Miércoles';
      case 'thursday':
        return 'Jueves';
      case 'friday':
        return 'Viernes';
      case 'saturday':
        return 'Sábado';
      case 'sunday':
        return 'Domingo';
      default:
        return day.dayOfWeek;
    }
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

  private loadAvailableVacationDays(): void {
    this.dashboardApi.getSummary().subscribe({
      next: (response) => {
        this.availableVacationDays.set(response.data.vacationBalanceDays);
      },
      error: () => {
        this.availableVacationDays.set(null);
      }
    });
  }

  private prepareNewRequestFlow(): void {
    this.isDetailDialogVisible.set(false);
    this.closeDetailAfterCancelState.set(false);
    this.vacations.clearSelection();
    this.vacations.clearPreview();
    this.activeStep.set(1);
  }
}

