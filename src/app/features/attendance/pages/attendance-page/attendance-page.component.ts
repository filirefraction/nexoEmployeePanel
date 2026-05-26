import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CurrentSessionService } from '../../../../core/session/current-session.service';
import { EmployeeAttendanceFacade } from '../../facades/employee-attendance.facade';

@Component({
  selector: 'app-attendance-page',
  imports: [DatePipe, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './attendance-page.component.html',
  styleUrl: './attendance-page.component.css'
})
export class AttendancePageComponent {
  private readonly formBuilder = inject(FormBuilder);
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

  constructor() {
    this.attendance.load();
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
      source: 'employee_web',
      observation: null
    });
  }

  protected submitCheckOut(): void {
    this.attendance.checkOut({
      source: 'employee_web',
      observation: null
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
}
