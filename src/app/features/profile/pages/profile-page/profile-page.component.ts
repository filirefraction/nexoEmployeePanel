import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EmployeeDashboardFacade } from '../../../dashboard/facades/employee-dashboard.facade';

@Component({
  selector: 'app-profile-page',
  imports: [NgIf],
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
}
