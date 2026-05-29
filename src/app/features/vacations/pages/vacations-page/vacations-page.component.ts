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
    item: Pick<VacationRequestListItem, 'vacationRequestStatusName'> | Pick<VacationRequest, 'vacationRequestStatusName'>
  ): string {
    switch (item.vacationRequestStatusName.toLowerCase()) {
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
    item: Pick<VacationRequestListItem, 'vacationRequestStatusName'> | Pick<VacationRequest, 'vacationRequestStatusName'>
  ): string {
    switch (item.vacationRequestStatusName.toLowerCase()) {
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
