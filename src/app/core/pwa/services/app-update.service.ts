import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly swUpdate = inject(SwUpdate);
  private readonly updateAvailableState = signal(false);
  private readonly updatingState = signal(false);

  readonly hasUpdate = computed(() => this.updateAvailableState());
  readonly isUpdating = computed(() => this.updatingState());

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateAvailableState.set(true);
      });

    of(null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.checkForUpdate();
      });

    interval(6 * 60 * 60 * 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.checkForUpdate();
      });
  }

  async activateUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled || this.updatingState()) {
      return;
    }

    this.updatingState.set(true);

    try {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } finally {
      this.updatingState.set(false);
    }
  }

  private async checkForUpdate(): Promise<void> {
    try {
      await this.swUpdate.checkForUpdate();
    } catch {
      // No interrumpimos la app si falla la verificacion de una nueva version.
    }
  }
}
