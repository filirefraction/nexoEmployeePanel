import { Component, computed, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EmployeeProfileFacade } from '../../../features/profile/facades/employee-profile.facade';
import { CurrentSessionService } from '../../session/current-session.service';
import { APP_NAV_ITEMS } from './employee-shell.navigation';

@Component({
  selector: 'app-employee-shell',
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive, RouterOutlet, ButtonModule, ConfirmDialogModule],
  templateUrl: './employee-shell.component.html',
})
export class EmployeeShellComponent {
  private readonly session = inject(CurrentSessionService);
  private readonly profile = inject(EmployeeProfileFacade);

  protected readonly navItems = inject(APP_NAV_ITEMS);
  protected readonly currentUser = this.session.currentUser;
  protected readonly profileData = this.profile.profile;
  protected readonly displayName = computed(() => {
    return this.profileData()?.employee.fullName || this.session.displayName();
  });
  protected readonly avatarUrl = computed(() => {
    return this.profileData()?.employee.imageUrl || this.currentUser()?.imageUrl || null;
  });
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

  constructor() {
    if (this.session.isAuthenticated() && !this.profile.profile() && !this.profile.isLoading()) {
      this.profile.load();
    }
  }

  protected logout(): void {
    this.session.logout().subscribe();
  }
}

