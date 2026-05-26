import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { PaginationMetadata } from '../../../shared/models/pagination.model';
import { EmployeeVacationRequestsApiService } from '../api/employee-vacation-requests.api.service';
import {
  VacationRequest,
  VacationRequestCreateRequest,
  VacationRequestFilter,
  VacationRequestListItem
} from '../models/vacation-request.model';

const DEFAULT_FILTER: VacationRequestFilter = {
  pageNumber: 1,
  pageSize: 10,
  fromDate: null,
  toDate: null
};

@Injectable({
  providedIn: 'root'
})
export class EmployeeVacationRequestsFacade {
  private readonly api = inject(EmployeeVacationRequestsApiService);
  private readonly apiError = inject(ApiErrorService);

  private readonly requestsState = signal<readonly VacationRequestListItem[]>([]);
  private readonly selectedRequestState = signal<VacationRequest | null>(null);
  private readonly paginationState = signal<PaginationMetadata | null>(null);
  private readonly filterState = signal<VacationRequestFilter>(DEFAULT_FILTER);
  private readonly loadingState = signal(false);
  private readonly detailLoadingState = signal(false);
  private readonly actionState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly successState = signal<string | null>(null);

  readonly requests = computed(() => this.requestsState());
  readonly selectedRequest = computed(() => this.selectedRequestState());
  readonly pagination = computed(() => this.paginationState());
  readonly filter = computed(() => this.filterState());
  readonly isLoading = computed(() => this.loadingState());
  readonly isDetailLoading = computed(() => this.detailLoadingState());
  readonly isActionInFlight = computed(() => this.actionState());
  readonly errorMessage = computed(() => this.errorState());
  readonly successMessage = computed(() => this.successState());

  load(filterPatch?: Partial<VacationRequestFilter>): void {
    const nextFilter = {
      ...this.filterState(),
      ...filterPatch
    };

    this.filterState.set(nextFilter);
    this.loadingState.set(true);
    this.errorState.set(null);

    this.api
      .getRequests(nextFilter)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.requestsState.set(response.data);
          this.paginationState.set(response.pagination ?? null);
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible cargar tus solicitudes de vacaciones.')
          );
        }
      });
  }

  selectRequest(id: string): void {
    this.detailLoadingState.set(true);
    this.errorState.set(null);

    this.api
      .getById(id)
      .pipe(finalize(() => this.detailLoadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.selectedRequestState.set(response.data);
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible cargar el detalle de la solicitud.')
          );
        }
      });
  }

  create(request: VacationRequestCreateRequest): void {
    if (this.actionState()) {
      return;
    }

    this.actionState.set(true);
    this.errorState.set(null);
    this.successState.set(null);

    this.api
      .create(request)
      .pipe(finalize(() => this.actionState.set(false)))
      .subscribe({
        next: (response) => {
          this.selectedRequestState.set(response.data);
          this.successState.set('Solicitud enviada correctamente.');
          this.load({ pageNumber: 1 });
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible crear tu solicitud de vacaciones.')
          );
        }
      });
  }

  cancel(id: string): void {
    if (this.actionState()) {
      return;
    }

    this.actionState.set(true);
    this.errorState.set(null);
    this.successState.set(null);

    this.api
      .cancel(id)
      .pipe(finalize(() => this.actionState.set(false)))
      .subscribe({
        next: (response) => {
          this.selectedRequestState.set(response.data);
          this.successState.set('Solicitud cancelada correctamente.');
          this.load();
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible cancelar la solicitud.')
          );
        }
      });
  }

  clearSelection(): void {
    this.selectedRequestState.set(null);
  }
}
