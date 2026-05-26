import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';
import { guestGuard } from './guest.guard';
import { CurrentSessionService } from '../session/current-session.service';

describe('guestGuard', () => {
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

  it('allows unauthenticated users', () => {
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('redirects compatible portal users to home', () => {
    const redirectTree = {} as UrlTree;
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(true);
    vi.mocked(sessionMock.isPortalCompatible).mockReturnValue(true);
    vi.mocked(routerMock.createUrlTree).mockReturnValue(redirectTree);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/app/inicio']);
    expect(result).toBe(redirectTree);
  });

  it('redirects incompatible users to access denied', () => {
    const redirectTree = {} as UrlTree;
    vi.mocked(sessionMock.isAuthenticated).mockReturnValue(true);
    vi.mocked(sessionMock.isPortalCompatible).mockReturnValue(false);
    vi.mocked(routerMock.createUrlTree).mockReturnValue(redirectTree);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/app/access-denied']);
    expect(result).toBe(redirectTree);
  });
});
