import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrentSessionService } from '../../../../core/session/current-session.service';
import { EmployeeAttendanceFacade } from '../../facades/employee-attendance.facade';
import { AttendanceRecordListItem } from '../../models/attendance-record.model';

@Component({
  selector: 'app-attendance-page',
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './attendance-page.component.html',
  styleUrl: './attendance-page.component.css'
})
export class AttendancePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly session = inject(CurrentSessionService);
  protected readonly attendance = inject(EmployeeAttendanceFacade);

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    fromDate: [''],
    toDate: [''],
    isManual: ['']
  });

  protected readonly records = this.attendance.records;
  protected readonly pagination = this.attendance.pagination;
  protected readonly isLoading = this.attendance.isLoading;
  protected readonly isActionInFlight = this.attendance.isActionInFlight;
  protected readonly errorMessage = this.attendance.errorMessage;
  protected readonly successMessage = this.attendance.successMessage;
  protected readonly latestActionRecord = this.attendance.latestActionRecord;
  protected readonly canCheckIn = this.attendance.canCheckIn;
  protected readonly canCheckOut = this.attendance.canCheckOut;
  protected readonly attendanceStatusLabel = this.attendance.attendanceStatusLabel;
  protected readonly attendanceActionHint = this.attendance.attendanceActionHint;

  constructor() {
    this.attendance.load();
    this.consumeDashboardAction();
  }

  protected applyFilters(): void {
    const value = this.filterForm.getRawValue();

    this.attendance.load({
      pageNumber: 1,
      fromDate: value.fromDate || null,
      toDate: value.toDate || null,
      isManual:
        value.isManual === ''
          ? null
          : value.isManual === 'true'
            ? true
            : false
    });
  }

  protected resetFilters(): void {
    this.filterForm.reset({
      fromDate: '',
      toDate: '',
      isManual: ''
    });
    this.attendance.load({
      pageNumber: 1,
      fromDate: null,
      toDate: null,
      isManual: null
    });
  }

  protected goToPage(pageNumber: number): void {
    const pagination = this.pagination();

    if (!pagination || pageNumber < 1 || pageNumber > pagination.totalPages) {
      return;
    }

    this.attendance.load({ pageNumber });
  }

  protected submitCheckIn(): void {
    this.attendance.checkIn({
      source: 'web',
      observation: null
    });
  }

  protected submitCheckOut(): void {
    this.attendance.checkOut({
      source: 'web',
      observation: null
    });
  }

  protected formatAttendanceDate(record: AttendanceRecordListItem): string {
    return this.formatDateOnly(record.attendanceDate, record.timeZone, {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  protected formatAttendanceTime(value: string | null | undefined, timeZone?: string | null): string {
    if (!value) {
      return 'Sin registro';
    }

    return this.formatDateTime(value, timeZone, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  private consumeDashboardAction(): void {
    const action = this.route.snapshot.queryParamMap.get('action');

    if (action === 'check-in') {
      this.submitCheckIn();
      this.clearDashboardAction();
      return;
    }

    if (action === 'check-out') {
      this.submitCheckOut();
      this.clearDashboardAction();
    }
  }

  private clearDashboardAction(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        action: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private formatDateOnly(
    value: string,
    timeZone: string | null | undefined,
    options: Intl.DateTimeFormatOptions
  ): string {
    const safeDate = new Date(`${value}T12:00:00Z`);
    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone: this.resolveTimeZone(timeZone)
    }).format(safeDate);
  }

  private formatDateTime(
    value: string,
    timeZone: string | null | undefined,
    options: Intl.DateTimeFormatOptions
  ): string {
    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone: this.resolveTimeZone(timeZone)
    }).format(this.parseUtcDateTime(value));
  }

  private resolveTimeZone(timeZone: string | null | undefined): string {
    return timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private parseUtcDateTime(value: string): Date {
    const hasOffset = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
    return new Date(hasOffset ? value : `${value}Z`);
  }
}
