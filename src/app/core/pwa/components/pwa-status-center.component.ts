import { Component, computed, inject } from '@angular/core';
import { CurrentSessionService } from '../../session/current-session.service';
import { AppUpdateService } from '../services/app-update.service';
import { InstallPromptService } from '../services/install-prompt.service';
import { NetworkStatusService } from '../services/network-status.service';

@Component({
  selector: 'app-pwa-status-center',
  imports: [],
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      @if (network.isOffline()) {
        <section
          class="pointer-events-auto mx-auto flex w-full max-w-5xl items-start gap-3 rounded-[22px] border border-[rgba(181,71,8,0.16)] bg-[rgba(255,247,237,0.96)] px-4 py-3 shadow-[0_18px_36px_rgba(23,26,31,0.12)] backdrop-blur-xl"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(181,71,8,0.12)] text-[var(--ne-warning)]"
          >
            <i class="pi pi-wifi"></i>
          </div>

          <div class="min-w-0 flex-1">
            <p class="m-0 text-sm font-semibold text-[var(--ne-ink)]">Sin conexion</p>
            <p class="m-0 text-xs leading-5 text-[var(--ne-slate)]">
              Algunas acciones pueden no estar disponibles hasta recuperar la red.
            </p>
          </div>
        </section>
      }
    </div>

    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6">
      <div class="mx-auto grid w-full max-w-md gap-3">
        @if (showUpdatePrompt()) {
          <section
            class="pointer-events-auto grid gap-3 rounded-[24px] border border-[var(--ne-line)] bg-white/96 px-4 py-4 shadow-[0_18px_36px_rgba(23,26,31,0.12)] backdrop-blur-xl"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ne-brand-soft)] text-[var(--ne-brand)]"
              >
                <i class="pi pi-download text-base"></i>
              </div>

              <div class="grid gap-1">
                <p class="m-0 text-sm font-semibold text-[var(--ne-ink)]">Nueva version disponible</p>
                <p class="m-0 text-xs leading-5 text-[var(--ne-slate)]">
                  Actualiza la app para recibir mejoras y correcciones recientes.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                class="inline-flex min-h-10 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--ne-brand),var(--ne-brand-strong))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="updates.isUpdating()"
                (click)="activateUpdate()"
              >
                Actualizar
              </button>
            </div>
          </section>
        }

        @if (showInstallPrompt()) {
          <section
            class="pointer-events-auto grid gap-3 rounded-[24px] border border-[var(--ne-line)] bg-white/96 px-4 py-4 shadow-[0_18px_36px_rgba(23,26,31,0.12)] backdrop-blur-xl"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ne-brand-soft)] text-[var(--ne-brand)]"
              >
                <i class="pi pi-mobile text-base"></i>
              </div>

              <div class="grid gap-1">
                <p class="m-0 text-sm font-semibold text-[var(--ne-ink)]">Instala Nexo Empleados</p>
                <p class="m-0 text-xs leading-5 text-[var(--ne-slate)]">
                  Agrega la app a tu inicio para entrar mas rapido y usar una experiencia mas cercana a app instalada.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                class="inline-flex min-h-10 items-center justify-center rounded-[16px] bg-[rgba(23,26,31,0.06)] px-4 py-2 text-sm font-semibold text-[var(--ne-ink)]"
                (click)="dismissInstall()"
              >
                Ahora no
              </button>
              <button
                type="button"
                class="inline-flex min-h-10 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--ne-brand),var(--ne-brand-strong))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)]"
                (click)="promptInstall()"
              >
                Instalar
              </button>
            </div>
          </section>
        }
      </div>
    </div>
  `
})
export class PwaStatusCenterComponent {
  protected readonly network = inject(NetworkStatusService);
  protected readonly install = inject(InstallPromptService);
  protected readonly updates = inject(AppUpdateService);
  private readonly session = inject(CurrentSessionService);

  protected readonly showInstallPrompt = computed(() => {
    return this.session.isAuthenticated() && this.install.canPrompt();
  });

  protected readonly showUpdatePrompt = computed(() => {
    return this.session.isAuthenticated() && this.updates.hasUpdate();
  });

  protected dismissInstall(): void {
    this.install.dismiss();
  }

  protected async promptInstall(): Promise<void> {
    await this.install.promptInstall();
  }

  protected async activateUpdate(): Promise<void> {
    await this.updates.activateUpdate();
  }
}
