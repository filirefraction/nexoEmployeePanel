import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeVacationRequestsFacade } from '../../facades/employee-vacation-requests.facade';
import {
  VacationRequest,
  VacationRequestListItem,
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
  imports: [DatePipe, DecimalPipe, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './vacations-page.component.html',
  styleUrl: './vacations-page.component.css'
})
export class VacationsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly vacations = inject(EmployeeVacationRequestsFacade);

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    fromDate: [''],
    toDate: ['']
  });

  protected readonly requestForm = this.formBuilder.nonNullable.group({
    fromDate: ['', [Validators.required]],
    requestedDays: [1, [Validators.required, Validators.min(1)]],
    reason: ['', [Validators.maxLength(500)]]
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
    this.requestForm.controls.fromDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.vacations.clearPreview());
    this.requestForm.controls.requestedDays.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.vacations.clearPreview());
  }

  protected applyFilters(): void {
    const value = this.filterForm.getRawValue();
    this.vacations.load({
      pageNumber: 1,
      fromDate: value.fromDate || null,
      toDate: value.toDate || null
    });
  }

  protected resetFilters(): void {
    this.filterForm.reset({
      fromDate: '',
      toDate: ''
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
      fromDate: value.fromDate,
      requestedDays: value.requestedDays,
      reason: value.reason || null
    });
  }

  protected calculatePreview(): void {
    if (this.requestForm.invalid || this.isPreviewLoading()) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.getRawValue();

    this.vacations.previewRequest({
      fromDate: value.fromDate,
      requestedDays: value.requestedDays
    });
  }

  protected viewRequest(id: string): void {
    this.vacations.selectRequest(id);
  }

  protected closeDetail(): void {
    this.vacations.clearSelection();
  }

  protected cancelSelected(): void {
    const selected = this.selectedRequest();

    if (!selected || !this.canCancel(selected)) {
      return;
    }

    this.vacations.cancel(selected.id);
  }

  protected goToPage(pageNumber: number): void {
    const pagination = this.pagination();

    if (!pagination || pageNumber < 1 || pageNumber > pagination.totalPages) {
      return;
    }

    this.vacations.load({ pageNumber });
  }

  protected getStatusLabel(
    item:
      | Pick<VacationRequestListItem, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
      | Pick<VacationRequest, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
  ): string {
    switch (this.resolveVacationRequestStatusCode(item.vacationRequestStatusId, item.vacationRequestStatusName)) {
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

  protected getStatusTone(
    item:
      | Pick<VacationRequestListItem, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
      | Pick<VacationRequest, 'vacationRequestStatusId' | 'vacationRequestStatusName'>
  ): string {
    switch (this.resolveVacationRequestStatusCode(item.vacationRequestStatusId, item.vacationRequestStatusName)) {
      case 'approved':
        return 'vacations-page__status--success';
      case 'rejected':
        return 'vacations-page__status--danger';
      case 'canceled':
        return 'vacations-page__status--muted';
      case 'pending':
      default:
        return 'vacations-page__status--warning';
    }
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
}
