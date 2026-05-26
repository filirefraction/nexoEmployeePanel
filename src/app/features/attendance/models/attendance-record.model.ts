export interface AttendanceRecordListItem {
  readonly id: string;
  readonly employeeId: string;
  readonly branchId?: string | null;
  readonly shiftId?: string | null;
  readonly timeZone?: string | null;
  readonly attendanceDate: string;
  readonly checkInDate?: string | null;
  readonly checkOutDate?: string | null;
  readonly workedMinutes?: number | null;
  readonly lateMinutes: number;
  readonly overtimeMinutes: number;
  readonly isLate: boolean;
  readonly isManual: boolean;
}

export interface AttendanceRecord {
  readonly id: string;
  readonly employeeId: string;
  readonly branchId?: string | null;
  readonly shiftId?: string | null;
  readonly timeZone?: string | null;
  readonly attendanceDate: string;
  readonly shiftStartDateTime?: string | null;
  readonly shiftEndDateTime?: string | null;
  readonly checkInDate?: string | null;
  readonly checkOutDate?: string | null;
  readonly checkInLatitude?: number | null;
  readonly checkInLongitude?: number | null;
  readonly checkOutLatitude?: number | null;
  readonly checkOutLongitude?: number | null;
  readonly checkInSource?: string | null;
  readonly checkOutSource?: string | null;
  readonly workedMinutes?: number | null;
  readonly lateMinutes: number;
  readonly overtimeMinutes: number;
  readonly isLate: boolean;
  readonly isManual: boolean;
  readonly observation?: string | null;
  readonly hasCheckIn: boolean;
  readonly hasCheckOut: boolean;
}

export interface AttendanceRecordFilter {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly fromDate?: string | null;
  readonly toDate?: string | null;
  readonly isManual?: boolean | null;
}

export interface AttendanceCheckInRequest {
  readonly branchId?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly source: string;
  readonly observation?: string | null;
}

export interface AttendanceCheckOutRequest {
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly source: string;
  readonly observation?: string | null;
}
