import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CurrentSessionService } from '../../session/current-session.service';
import { APP_NAV_ITEMS } from './employee-shell.navigation';

@Component({
  selector: 'app-employee-shell',
  imports: [NgFor, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './employee-shell.component.html',
  styleUrl: './employee-shell.component.css'
})
export class EmployeeShellComponent {
  private readonly session = inject(CurrentSessionService);

  protected readonly appName = 'Nexo Empleado';
  protected readonly navItems = inject(APP_NAV_ITEMS);
  protected readonly currentUser = this.session.currentUser;
  protected readonly displayName = this.session.displayName;

  protected logout(): void {
    this.session.logout().subscribe();
  }
}
