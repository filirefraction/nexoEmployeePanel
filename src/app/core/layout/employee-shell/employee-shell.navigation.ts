import { InjectionToken } from '@angular/core';

export interface EmployeeShellNavItem {
  readonly label: string;
  readonly link: string;
  readonly icon: string;
}

export const APP_NAV_ITEMS = new InjectionToken<EmployeeShellNavItem[]>('APP_NAV_ITEMS', {
  factory: () => [
    { label: 'Inicio', link: '/app/inicio', icon: 'pi pi-home' },
    { label: 'Asistencia', link: '/app/asistencia', icon: 'pi pi-clock' },
    { label: 'Vacaciones', link: '/app/vacaciones', icon: 'pi pi-calendar' },
    { label: 'Perfil', link: '/app/perfil', icon: 'pi pi-user' }
  ]
});
