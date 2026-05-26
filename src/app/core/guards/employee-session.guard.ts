import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentSessionService } from '../session/current-session.service';

export const employeeSessionGuard: CanActivateFn = (_route, state) => {
  const session = inject(CurrentSessionService);
  const router = inject(Router);

  if (!session.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
  }

  return session.isPortalCompatible() ? true : router.createUrlTree(['/app/access-denied']);
};
