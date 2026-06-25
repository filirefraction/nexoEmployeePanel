import { NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { AuthCompanyOption } from '../../../../core/auth/models/auth-company-option.model';
import { ApiErrorService } from '../../../../core/http/api-error.service';
import { CurrentSessionService } from '../../../../core/session/current-session.service';

interface CompanySelectOption {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-login-page',
  imports: [
    NgIf,
    ReactiveFormsModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    SelectModule
  ],
  templateUrl: './login-page.component.html',
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
  protected readonly companySelectOptions = computed<CompanySelectOption[]>(() =>
    this.companyOptions().map((company) => ({
      label: company.tradeName || company.name,
      value: company.companyId
    }))
  );
  protected readonly requiresCompanySelection = computed(
    () => this.companyOptions().length > 0
  );
  protected readonly infoMessage =
    this.route.snapshot.queryParamMap.get('reason') === 'session-expired'
      ? 'Tu sesion termino. Ingresa nuevamente para continuar.'
      : null;
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    companyIdHint: ['']
  });

  protected submit(): void {
    if (
      this.requiresCompanySelection() &&
      !this.loginForm.controls.companyIdHint.getRawValue().trim()
    ) {
      this.loginForm.controls.companyIdHint.markAsTouched();
      this.loginForm.controls.companyIdHint.setErrors({ required: true });
      return;
    }

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
            this.loginForm.controls.companyIdHint.addValidators([Validators.required]);
            this.loginForm.controls.companyIdHint.updateValueAndValidity({ emitEvent: false });
            this.errorMessage.set(
              response.companies.length > 0
                ? 'Selecciona la empresa con la que deseas iniciar sesion.'
                : 'No fue posible resolver la empresa de acceso para este usuario.'
            );
            return;
          }

          if (!response.user) {
            this.errorMessage.set('No fue posible iniciar sesion.');
            return;
          }

          const targetUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/inicio';
          if (!this.session.isUserPortalCompatible(response.user)) {
            this.session.rejectIncompatibleSession();
            return;
          }

          this.companyOptions.set([]);
          this.loginForm.controls.companyIdHint.clearValidators();
          this.loginForm.controls.companyIdHint.setValue('', { emitEvent: false });
          this.loginForm.controls.companyIdHint.updateValueAndValidity({ emitEvent: false });
          void this.router.navigateByUrl(targetUrl);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            this.apiError.getDisplayMessage(error, 'No fue posible iniciar sesion.')
          );
        }
      });
  }

  protected shouldShowFieldError(fieldName: 'email' | 'password' | 'companyIdHint'): boolean {
    const control = this.loginForm.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }
}

