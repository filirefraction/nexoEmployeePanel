import { InjectionToken } from '@angular/core';

export interface EmployeeShellNavItem {
  readonly label: string;
  readonly link: string;
}

export const APP_NAV_ITEMS = new InjectionToken<EmployeeShellNavItem[]>('APP_NAV_ITEMS', {
  factory: () => [
    { label: 'Inicio', link: '/app/inicio' },
    { label: 'Asistencia', link: '/app/asistencia' },
    { label: 'Vacaciones', link: '/app/vacaciones' },
    { label: 'Perfil', link: '/app/perfil' }
  ]
});
