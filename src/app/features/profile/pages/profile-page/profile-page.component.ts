import { DatePipe, NgIf } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { AuthApiService } from '../../../../core/auth/auth-api.service';
import { ApiErrorService } from '../../../../core/http/api-error.service';
import { AppConfirmDialogService } from '../../../../core/services/app-confirm-dialog.service';
import { CurrentSessionService } from '../../../../core/session/current-session.service';
import { EmployeeProfileFacade } from '../../facades/employee-profile.facade';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmNewPassword = control.get('confirmNewPassword')?.value;

  if (!newPassword || !confirmNewPassword) {
    return null;
  }

  return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-profile-page',
  imports: [
    DatePipe,
    NgIf,
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    FloatLabelModule,
    MessageModule,
    PasswordModule,
    TagModule
  ],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly confirmDialog = inject(AppConfirmDialogService);
  private readonly session = inject(CurrentSessionService);

  protected readonly profile = inject(EmployeeProfileFacade);
  protected readonly summary = this.profile.profile;
  protected readonly isLoading = this.profile.isLoading;
  protected readonly errorMessage = this.profile.errorMessage;
  protected readonly currentUser = this.session.currentUser;
  protected readonly isChangingPassword = signal(false);
  protected readonly isDeletingAccount = signal(false);
  protected readonly isChangePasswordDialogVisible = signal(false);
  protected readonly deleteAccountExpanded = signal(false);
  protected readonly securityErrorMessage = signal<string | null>(null);
  protected readonly deleteAccountErrorMessage = signal<string | null>(null);
  protected readonly changePasswordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
    },
    {
      validators: passwordMatchValidator
    }
  );
  protected readonly deleteAccountForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
  });

  constructor() {
    if (!this.summary()) {
      this.profile.load();
    }
  }

  protected getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected openChangePasswordDialog(): void {
    this.isChangePasswordDialogVisible.set(true);
    this.deleteAccountExpanded.set(false);
    this.securityErrorMessage.set(null);
    this.deleteAccountErrorMessage.set(null);
    this.changePasswordForm.reset();
    this.deleteAccountForm.reset();
  }

  protected closeChangePasswordDialog(): void {
    this.isChangePasswordDialogVisible.set(false);
    this.securityErrorMessage.set(null);
    this.changePasswordForm.reset();
  }

  protected toggleDeleteAccount(): void {
    this.deleteAccountExpanded.update((value) => !value);
    this.isChangePasswordDialogVisible.set(false);
    this.securityErrorMessage.set(null);
    this.deleteAccountErrorMessage.set(null);
    this.changePasswordForm.reset();
    this.deleteAccountForm.reset();
  }

  protected submitChangePassword(): void {
    if (this.changePasswordForm.invalid || this.isChangingPassword()) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.changePasswordForm.getRawValue();
    this.isChangingPassword.set(true);
    this.securityErrorMessage.set(null);

    this.authApi
      .changePassword({
        currentPassword,
        newPassword
      })
      .pipe(finalize(() => this.isChangingPassword.set(false)))
      .subscribe({
        next: () => {
          this.changePasswordForm.reset();
          this.isChangePasswordDialogVisible.set(false);
          this.session.redirectToLoginWithReason('password-changed');
        },
        error: (error: unknown) => {
          this.securityErrorMessage.set(
            this.apiError.getDisplayMessage(error, 'No fue posible actualizar tu contrasena.')
          );
        }
      });
  }

  protected submitDeleteAccount(): void {
    if (this.deleteAccountForm.invalid || this.isDeletingAccount()) {
      this.deleteAccountForm.markAllAsTouched();
      return;
    }

    this.confirmDialog.confirm({
      header: 'Desactivar acceso',
      message: 'Se desactivara tu acceso al portal personal. Deseas continuar?',
      acceptLabel: 'Desactivar',
      acceptSeverity: 'danger',
      accept: () => {
        this.isDeletingAccount.set(true);
        this.deleteAccountErrorMessage.set(null);

        this.authApi
          .deleteCurrentAccount({
            currentPassword: this.deleteAccountForm.controls.currentPassword.getRawValue()
          })
          .pipe(finalize(() => this.isDeletingAccount.set(false)))
          .subscribe({
            next: () => {
              this.deleteAccountForm.reset();
              this.deleteAccountExpanded.set(false);
              this.session.redirectToLoginWithReason('account-deactivated');
            },
            error: (error: unknown) => {
              this.deleteAccountErrorMessage.set(
                this.apiError.getDisplayMessage(error, 'No fue posible procesar tu solicitud.')
              );
            }
          });
      }
    });
  }

  protected shouldShowChangePasswordFieldError(
    fieldName: 'currentPassword' | 'newPassword' | 'confirmNewPassword'
  ): boolean {
    const control = this.changePasswordForm.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected shouldShowDeleteAccountFieldError(fieldName: 'currentPassword'): boolean {
    const control = this.deleteAccountForm.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }
}

