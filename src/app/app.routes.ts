import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { employeeSessionGuard } from './core/guards/employee-session.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/inicio'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/layout/auth-shell/auth-shell.component').then((m) => m.AuthShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page.component').then(
            (m) => m.LoginPageComponent
          )
      }
    ]
  },
  {
    path: 'session-expired',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/layout/auth-shell/auth-shell.component').then((m) => m.AuthShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/system/pages/session-expired-page/session-expired-page.component').then(
            (m) => m.SessionExpiredPageComponent
          )
      }
    ]
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./core/layout/auth-shell/auth-shell.component').then((m) => m.AuthShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/system/pages/access-denied-page/access-denied-page.component').then(
            (m) => m.AccessDeniedPageComponent
          )
      }
    ]
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/employee-shell/employee-shell.component').then(
        (m) => m.EmployeeShellComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio'
      },
      {
        path: 'inicio',
        canActivate: [employeeSessionGuard],
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          )
      },
      {
        path: 'asistencia',
        canActivate: [employeeSessionGuard],
        loadComponent: () =>
          import('./features/attendance/pages/attendance-page/attendance-page.component').then(
            (m) => m.AttendancePageComponent
          )
      },
      {
        path: 'vacaciones',
        canActivate: [employeeSessionGuard],
        loadComponent: () =>
          import('./features/vacations/pages/vacations-page/vacations-page.component').then(
            (m) => m.VacationsPageComponent
          )
      },
      {
        path: 'perfil',
        canActivate: [employeeSessionGuard],
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          )
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./features/system/pages/access-denied-page/access-denied-page.component').then(
            (m) => m.AccessDeniedPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/system/pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      )
  }
];
