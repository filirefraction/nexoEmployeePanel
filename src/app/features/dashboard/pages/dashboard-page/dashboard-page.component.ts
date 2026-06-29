import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { EmployeeDashboardFacade } from '../../facades/employee-dashboard.facade';
import { EmployeeAttendanceSnapshot, EmployeeSummary } from '../../models/employee-summary.model';

@Component({
  selector: 'app-dashboard-page',
  imports: [DecimalPipe, NgFor, NgIf, RouterLink, ButtonModule, TagModule],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  protected readonly dashboard = inject(EmployeeDashboardFacade);
  protected readonly summary = this.dashboard.summary;
  protected readonly isLoading = this.dashboard.isLoading;
  protected readonly errorMessage = this.dashboard.errorMessage;
  protected readonly primaryAction = computed(() => this.resolvePrimaryAction(this.summary()));
  protected readonly secondaryAction = computed(() => this.resolveSecondaryAction(this.summary()));

  constructor() {
    this.dashboard.load();
  }

  protected getAttendanceStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'checked_in':
        return 'Con entrada activa';
      case 'checked_out':
        return 'Jornada cerrada';
      case 'absent':
        return 'Ausencia registrada';
      case 'non_working_day':
        return 'Dia no laborable';
      default:
        return 'Pendiente de entrada';
    }
  }

  protected getAttendanceTagSeverity(
    status: string | undefined
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'checked_in':
        return 'success';
      case 'checked_out':
        return 'secondary';
      case 'absent':
        return 'danger';
      case 'non_working_day':
        return 'secondary';
      default:
        return 'warn';
    }
  }

  protected getAttendanceStatusTone(status: string | undefined): string {
    switch (status) {
      case 'checked_in':
        return 'dashboard-status dashboard-status--success';
      case 'checked_out':
        return 'dashboard-status dashboard-status--neutral';
      case 'absent':
        return 'dashboard-status dashboard-status--danger';
      case 'non_working_day':
        return 'dashboard-status dashboard-status--neutral';
      default:
        return 'dashboard-status dashboard-status--warning';
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

  protected formatLocalDate(
    value: string,
    timeZone: string,
    options: Intl.DateTimeFormatOptions
  ): string {
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

  protected getInitials(fullName: string | null | undefined): string {
    if (!fullName?.trim()) {
      return 'NE';
    }

    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'NE';
  }

  private parseUtcDateTime(value: string): Date {
    const hasOffset = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
    return new Date(hasOffset ? value : `${value}Z`);
  }

  private resolvePrimaryAction(summary: EmployeeSummary | null): DashboardAction {
    if (!summary) {
      return {
        label: 'Ir a asistencia',
        link: '/app/asistencia'
      };
    }

    if (summary.canCheckIn) {
      return {
        label: 'Registrar entrada',
        link: '/app/asistencia',
        queryParams: { action: 'check-in' }
      };
    }

    if (summary.canCheckOut) {
      return {
        label: 'Registrar salida',
        link: '/app/asistencia',
        queryParams: { action: 'check-out' }
      };
    }

    return {
      label: 'Ver asistencia',
      link: '/app/asistencia'
    };
  }

  private resolveSecondaryAction(summary: EmployeeSummary | null): DashboardAction {
    if (summary?.pendingVacationRequests) {
      return {
        label: 'Revisar vacaciones',
        link: '/app/vacaciones'
      };
    }

    if ((summary?.vacationBalanceDays ?? 0) > 0) {
      return {
        label: 'Solicitar vacaciones',
        link: '/app/vacaciones',
        queryParams: { action: 'new-request' }
      };
    }

    return {
      label: 'Ver perfil',
      link: '/app/perfil'
    };
  }
}

interface DashboardAction {
  readonly label: string;
  readonly link: string;
  readonly queryParams?: Record<string, string>;
}

