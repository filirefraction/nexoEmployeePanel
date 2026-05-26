import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeVacationRequestsFacade } from '../../facades/employee-vacation-requests.facade';
import { VacationRequest, VacationRequestListItem } from '../../models/vacation-request.model';

@Component({
  selector: 'app-vacations-page',
  imports: [DatePipe, DecimalPipe, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './vacations-page.component.html',
  styleUrl: './vacations-page.component.css'
})
export class VacationsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly vacations = inject(EmployeeVacationRequestsFacade);

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    fromDate: [''],
    toDate: ['']
  });

  protected readonly requestForm = this.formBuilder.nonNullable.group({
    fromDate: ['', [Validators.required]],
    toDate: ['', [Validators.required]],
    reason: ['', [Validators.maxLength(500)]]
  });

  protected readonly requests = this.vacations.requests;
  protected readonly selectedRequest = this.vacations.selectedRequest;
  protected readonly pagination = this.vacations.pagination;
  protected readonly isLoading = this.vacations.isLoading;
  protected readonly isDetailLoading = this.vacations.isDetailLoading;
  protected readonly isActionInFlight = this.vacations.isActionInFlight;
  protected readonly errorMessage = this.vacations.errorMessage;
  protected readonly successMessage = this.vacations.successMessage;

  constructor() {
    this.vacations.load();
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
    if (this.requestForm.invalid || this.isActionInFlight()) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.getRawValue();

    this.vacations.create({
      fromDate: value.fromDate,
      toDate: value.toDate,
      reason: value.reason || null
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

  protected getStatusLabel(item: Pick<VacationRequestListItem, 'isApproved' | 'isRejected'>): string {
    if (item.isApproved) {
      return 'Aprobada';
    }

    if (item.isRejected) {
      return 'Rechazada';
    }

    return 'Pendiente';
  }

  protected getStatusTone(item: Pick<VacationRequestListItem, 'isApproved' | 'isRejected'>): string {
    if (item.isApproved) {
      return 'vacations-page__status--success';
    }

    if (item.isRejected) {
      return 'vacations-page__status--danger';
    }

    return 'vacations-page__status--warning';
  }

  protected canCancel(item: Pick<VacationRequest, 'isApproved' | 'isRejected'>): boolean {
    return !item.isApproved && !item.isRejected;
  }
}
