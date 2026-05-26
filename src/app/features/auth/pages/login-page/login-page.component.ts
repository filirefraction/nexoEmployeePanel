import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
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
  protected readonly infoMessage =
    this.route.snapshot.queryParamMap.get('reason') === 'session-expired'
      ? 'Tu sesión terminó. Ingresa nuevamente para continuar.'
      : null;
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected submit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.session
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          const targetUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/inicio';
          const redirectUrl = this.session.isPortalCompatible() ? targetUrl : '/app/access-denied';
          void this.router.navigateByUrl(redirectUrl);
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
