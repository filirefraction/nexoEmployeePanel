import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { CurrentSessionService } from '../session/current-session.service';

describe('authGuard', () => {
  let sessionMock: { isAuthenticated: ReturnType<typeof vi.fn> };
  let routerMock: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionMock = {
      isAuthenticated: vi.fn()
    };

    routerMock = {
      createUrlTree: vi.fn().mockReturnValue({} as UrlTree)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CurrentSessionService, useValue: sessionMock as unknown as CurrentSessionService },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('allows authenticated users', () => {
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/app/inicio' } as never)
    );

    expect(result).toBe(true);
  });

  it('redirects guests to login with returnUrl', () => {
    const redirectTree = {} as UrlTree;
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(false);
    vi.mocked(routerMock.createUrlTree).mockReturnValue(redirectTree);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/app/perfil' } as never)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/app/perfil' }
    });
    expect(result).toBe(redirectTree);
  });
});
