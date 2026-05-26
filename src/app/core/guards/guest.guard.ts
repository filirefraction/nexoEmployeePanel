import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentSessionService } from '../session/current-session.service';

export const guestGuard: CanActivateFn = () => {
  const session = inject(CurrentSessionService);
  const router = inject(Router);

  if (!session.isAuthenticated()) {
    return true;
  }

  return session.isPortalCompatible()
    ? router.createUrlTree(['/app/inicio'])
    : router.createUrlTree(['/app/access-denied']);
};
