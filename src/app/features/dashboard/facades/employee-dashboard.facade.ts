import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { EmployeeDashboardApiService } from '../api/employee-dashboard.api.service';
import { EmployeeSummary } from '../models/employee-summary.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDashboardFacade {
  private readonly api = inject(EmployeeDashboardApiService);
  private readonly apiError = inject(ApiErrorService);

  private readonly summaryState = signal<EmployeeSummary | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly summary = computed(() => this.summaryState());
  readonly isLoading = computed(() => this.loadingState());
  readonly errorMessage = computed(() => this.errorState());

  load(): void {
    if (this.loadingState()) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set(null);

    this.api
      .getSummary()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.summaryState.set(response.data);
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible cargar tu resumen de inicio.')
          );
        }
      });
  }
}
