import { DatePipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { EmployeeDashboardFacade } from '../../../dashboard/facades/employee-dashboard.facade';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, NgIf, RouterLink, ButtonModule, TagModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  protected readonly dashboard = inject(EmployeeDashboardFacade);
  protected readonly summary = this.dashboard.summary;
  protected readonly isLoading = this.dashboard.isLoading;
  protected readonly errorMessage = this.dashboard.errorMessage;

  constructor() {
    if (!this.summary()) {
      this.dashboard.load();
    }
  }

  protected getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? '')
      .join('');
  }
}
