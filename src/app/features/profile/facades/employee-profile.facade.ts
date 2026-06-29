import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { EmployeeProfileApiService } from '../api/employee-profile.api.service';
import { EmployeeProfile } from '../models/employee-profile.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileFacade {
  private readonly api = inject(EmployeeProfileApiService);
  private readonly apiError = inject(ApiErrorService);

  private readonly profileState = signal<EmployeeProfile | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly profile = computed(() => this.profileState());
  readonly isLoading = computed(() => this.loadingState());
  readonly errorMessage = computed(() => this.errorState());

  load(): void {
    if (this.loadingState()) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set(null);

    this.api
      .getProfile()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.profileState.set(response.data);
        },
        error: (error: unknown) => {
          this.errorState.set(
            this.apiError.getDisplayMessage(error, 'No fue posible cargar tu perfil.')
          );
        }
      });
  }
}
