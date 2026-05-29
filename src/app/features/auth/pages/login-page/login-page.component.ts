import { NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthCompanyOption } from '../../../../core/auth/models/auth-company-option.model';
import { ApiErrorService } from '../../../../core/http/api-error.service';
import { CurrentSessionService } from '../../../../core/session/current-session.service';

@Component({
  selector: 'app-login-page',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly session = inject(CurrentSessionService);
  private readonly apiError = inject(ApiErrorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly companyOptions = signal<AuthCompanyOption[]>([]);
  protected readonly requiresCompanySelection = computed(
    () => this.companyOptions().length > 0
  );
  protected readonly infoMessage =
    this.route.snapshot.queryParamMap.get('reason') === 'session-expired'
      ? 'Tu sesión terminó. Ingresa nuevamente para continuar.'
      : null;
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    companyIdHint: ['']
  });

  protected submit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.session
      .login({
        email: this.loginForm.controls.email.getRawValue().trim(),
        password: this.loginForm.controls.password.getRawValue(),
        companyIdHint: this.loginForm.controls.companyIdHint.getRawValue().trim() || null
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          if (response.requiresCompanySelection) {
            this.companyOptions.set([...response.companies]);
            this.errorMessage.set(
              response.companies.length > 0
                ? 'Selecciona la empresa con la que deseas iniciar sesión.'
                : 'No fue posible resolver la empresa de acceso para este usuario.'
            );
            return;
          }

          if (!response.user) {
            this.errorMessage.set('No fue posible iniciar sesión.');
            return;
          }

          const targetUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/inicio';
          if (!this.session.isUserPortalCompatible(response.user)) {
            this.session.rejectIncompatibleSession();
            return;
          }

          this.companyOptions.set([]);
          void this.router.navigateByUrl(targetUrl);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            this.apiError.getDisplayMessage(error, 'No fue posible iniciar sesión.')
          );
        }
      });
  }

  protected shouldShowFieldError(fieldName: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }
}
