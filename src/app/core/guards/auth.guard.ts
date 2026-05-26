import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentSessionService } from '../session/current-session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(CurrentSessionService);
  const router = inject(Router);

  return session.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], {
        queryParams: {
          returnUrl: state.url
        }
      });
};
