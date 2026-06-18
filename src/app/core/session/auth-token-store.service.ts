import { Injectable } from '@angular/core';

interface StoredAuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAtUtc: string;
  readonly refreshTokenExpiresAtUtc: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthTokenStoreService {
  private readonly storageKey = 'nexo-employee-panel.auth-session';

  getAccessToken(): string | null {
    return this.read()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.read()?.refreshToken ?? null;
  }

  getAccessTokenExpiresAtUtc(): string | null {
    return this.read()?.accessTokenExpiresAtUtc ?? null;
  }

  hasRefreshToken(): boolean {
    return Boolean(this.getRefreshToken());
  }

  save(session: StoredAuthSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  replaceAccessToken(accessToken: string, accessTokenExpiresAtUtc: string): void {
    const currentSession = this.read();

    if (!currentSession) {
      return;
    }

    this.save({
      ...currentSession,
      accessToken,
      accessTokenExpiresAtUtc
    });
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  private read(): StoredAuthSession | null {
    const rawValue = localStorage.getItem(this.storageKey);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as StoredAuthSession;
    } catch {
      this.clear();
      return null;
    }
  }
}
