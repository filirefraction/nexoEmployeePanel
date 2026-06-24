import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class InstallPromptService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly deferredPromptState = signal<BeforeInstallPromptEvent | null>(null);
  private readonly installedState = signal(this.detectStandaloneMode());
  private readonly dismissedState = signal(false);

  readonly canPrompt = computed(() => {
    return Boolean(this.deferredPromptState()) && !this.installedState() && !this.dismissedState();
  });
  readonly isInstalled = computed(() => this.installedState());

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    fromEvent(window, 'beforeinstallprompt')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        const promptEvent = event as BeforeInstallPromptEvent;
        promptEvent.preventDefault();
        this.deferredPromptState.set(promptEvent);
        this.dismissedState.set(false);
      });

    fromEvent(window, 'appinstalled')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.installedState.set(true);
        this.deferredPromptState.set(null);
        this.dismissedState.set(false);
      });
  }

  dismiss(): void {
    this.dismissedState.set(true);
  }

  async promptInstall(): Promise<boolean> {
    const prompt = this.deferredPromptState();

    if (!prompt) {
      return false;
    }

    await prompt.prompt();
    const result = await prompt.userChoice;

    if (result.outcome === 'accepted') {
      this.dismissedState.set(false);
    } else {
      this.dismissedState.set(true);
    }

    this.deferredPromptState.set(null);
    return result.outcome === 'accepted';
  }

  private detectStandaloneMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const isStandaloneMedia = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
    const isNavigatorStandalone =
      'standalone' in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

    return isStandaloneMedia || isNavigatorStandalone;
  }
}
