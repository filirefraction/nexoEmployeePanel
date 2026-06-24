import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly onlineState = signal(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  readonly isOnline = computed(() => this.onlineState());
  readonly isOffline = computed(() => !this.onlineState());

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    merge(
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.onlineState.set(window.navigator.onLine);
      });
  }
}
