import { Injectable, inject } from '@angular/core';
import { Confirmation, ConfirmationService } from 'primeng/api';

export interface AppConfirmDialogOptions {
  readonly message: string;
  readonly accept: () => void;
  readonly header?: string;
  readonly icon?: string;
  readonly acceptLabel?: string;
  readonly rejectLabel?: string;
  readonly acceptSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast';
}

@Injectable({
  providedIn: 'root'
})
export class AppConfirmDialogService {
  private readonly confirmationService = inject(ConfirmationService);

  confirm(options: AppConfirmDialogOptions): void {
    const confirmation: Confirmation = {
      header: options.header ?? 'Confirmar accion',
      message: options.message,
      icon: options.icon ?? 'pi pi-exclamation-triangle',
      acceptLabel: options.acceptLabel ?? 'Continuar',
      rejectLabel: options.rejectLabel ?? 'Cancelar',
      defaultFocus: 'reject',
      closeOnEscape: true,
      dismissableMask: true,
      acceptButtonProps: {
        severity: options.acceptSeverity ?? 'danger'
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true
      },
      accept: options.accept
    };

    this.confirmationService.confirm(confirmation);
  }
}
