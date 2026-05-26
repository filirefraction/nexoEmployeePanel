import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EmployeeDashboardFacade } from '../../facades/employee-dashboard.facade';
import { EmployeeAttendanceSnapshot } from '../../models/employee-summary.model';

@Component({
  selector: 'app-dashboard-page',
  imports: [DecimalPipe, NgFor, NgIf],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {
  protected readonly dashboard = inject(EmployeeDashboardFacade);
  protected readonly summary = this.dashboard.summary;
  protected readonly isLoading = this.dashboard.isLoading;
  protected readonly errorMessage = this.dashboard.errorMessage;

  constructor() {
    this.dashboard.load();
  }

  protected getAttendanceStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'checked_in':
        return 'Con check-in activo';
      case 'checked_out':
        return 'Jornada cerrada';
      case 'absent':
        return 'Ausencia registrada';
      case 'non_working_day':
        return 'Día no laborable';
      default:
        return 'Pendiente de check-in';
    }
  }

  protected getAttendanceStatusTone(status: string | undefined): string {
    switch (status) {
      case 'checked_in':
        return 'dashboard-page__status--success';
      case 'checked_out':
        return 'dashboard-page__status--neutral';
      case 'absent':
        return 'dashboard-page__status--danger';
      case 'non_working_day':
        return 'dashboard-page__status--neutral';
      default:
        return 'dashboard-page__status--warning';
    }
  }

  protected formatMinutes(totalMinutes: number | null | undefined): string {
    if (!totalMinutes || totalMinutes <= 0) {
      return '0 min';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (!hours) {
      return `${minutes} min`;
    }

    if (!minutes) {
      return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
  }

  protected trackAttendance(_index: number, item: EmployeeAttendanceSnapshot): string {
    return item.id;
  }

  protected formatLocalDateTime(
    value: string | null | undefined,
    timeZone: string,
    options: Intl.DateTimeFormatOptions
  ): string {
    if (!value) {
      return 'Sin registro';
    }

    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone
    }).format(new Date(value));
  }

  protected formatLocalDate(value: string, timeZone: string, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone
    }).format(new Date(`${value}T12:00:00Z`));
  }

  protected formatUtcDateTime(
    value: string | null | undefined,
    timeZone: string,
    options: Intl.DateTimeFormatOptions
  ): string {
    if (!value) {
      return 'Sin registro';
    }

    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone
    }).format(this.parseUtcDateTime(value));
  }

  private parseUtcDateTime(value: string): Date {
    const hasOffset = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
    return new Date(hasOffset ? value : `${value}Z`);
  }
}
