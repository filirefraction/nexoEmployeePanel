import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';
import { employeeSessionGuard } from './employee-session.guard';
import { CurrentSessionService } from '../session/current-session.service';

describe('employeeSessionGuard', () => {
  let sessionMock: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    isPortalCompatible: ReturnType<typeof vi.fn>;
  };
  let routerMock: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionMock = {
      isAuthenticated: vi.fn(),
      isPortalCompatible: vi.fn()
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

  it('allows authenticated compatible users', () => {
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(true);
    vi.mocked(sessionMock.isPortalCompatible).mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      employeeSessionGuard({} as never, { url: '/app/vacaciones' } as never)
    );

    expect(result).toBe(true);
  });

  it('redirects unauthenticated users to login with returnUrl', () => {
    const redirectTree = {} as UrlTree;
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(false);
    vi.mocked(routerMock.createUrlTree).mockReturnValue(redirectTree);

    const result = TestBed.runInInjectionContext(() =>
      employeeSessionGuard({} as never, { url: '/app/asistencia' } as never)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/app/asistencia' }
    });
    expect(result).toBe(redirectTree);
  });

  it('redirects incompatible users to access denied', () => {
    const redirectTree = {} as UrlTree;
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(true);
    vi.mocked(sessionMock.isPortalCompatible).mockReturnValue(false);
    vi.mocked(routerMock.createUrlTree).mockReturnValue(redirectTree);

    const result = TestBed.runInInjectionContext(() =>
      employeeSessionGuard({} as never, { url: '/app/perfil' } as never)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/app/access-denied']);
    expect(result).toBe(redirectTree);
  });
});
