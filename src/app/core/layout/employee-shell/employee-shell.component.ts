import { Component, computed, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CurrentSessionService } from '../../session/current-session.service';
import { APP_NAV_ITEMS } from './employee-shell.navigation';

@Component({
  selector: 'app-employee-shell',
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive, RouterOutlet, ButtonModule],
  templateUrl: './employee-shell.component.html',
  styleUrl: './employee-shell.component.css'
})
export class EmployeeShellComponent {
  private readonly session = inject(CurrentSessionService);

  protected readonly navItems = inject(APP_NAV_ITEMS);
  protected readonly currentUser = this.session.currentUser;
  protected readonly displayName = this.session.displayName;
  protected readonly initials = computed(() => {
    const parts = this.displayName()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (parts.length === 0) {
      return 'NE';
    }

    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  });

  protected logout(): void {
    this.session.logout().subscribe();
  }
}
