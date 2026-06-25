export interface EmployeeProfileSummary {
  readonly id: string;
  readonly employeeNumber?: string | null;
  readonly fullName: string;
  readonly email?: string | null;
  readonly branchId?: string | null;
  readonly branchName?: string | null;
  readonly departmentId?: string | null;
  readonly departmentName?: string | null;
  readonly jobPositionId?: string | null;
  readonly jobPositionName?: string | null;
  readonly imageUrl?: string | null;
  readonly isAttendanceRequired: boolean;
  readonly isRemoteAllowed: boolean;
  readonly companyRequireGps: boolean;
  readonly companyRequirePhoto: boolean;
  readonly companyAllowRemoteAttendance: boolean;
  readonly branchLatitude?: number | null;
  readonly branchLongitude?: number | null;
  readonly branchAllowedRadiusMeters?: number | null;
}

export interface EmployeeShiftSummary {
  readonly shiftId: string;
  readonly name: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly toleranceMinutes: number;
  readonly isOvernight: boolean;
  readonly scheduledStartLocal: string;
  readonly scheduledEndLocal: string;
}

export interface EmployeeAttendanceSnapshot {
  readonly id: string;
  readonly attendanceDate: string;
  readonly branchId?: string | null;
  readonly shiftId?: string | null;
  readonly checkInDate?: string | null;
  readonly checkOutDate?: string | null;
  readonly workedMinutes?: number | null;
  readonly lateMinutes: number;
  readonly overtimeMinutes: number;
  readonly isLate: boolean;
  readonly isAbsent: boolean;
  readonly isManual: boolean;
  readonly checkInSource?: string | null;
  readonly checkOutSource?: string | null;
  readonly observation?: string | null;
}

export interface EmployeeIncidentSummary {
  readonly id: string;
  readonly incidentDate: string;
  readonly attendanceIncidentTypeId: string;
  readonly incidentTypeCode: string;
  readonly incidentTypeName: string;
  readonly description?: string | null;
  readonly approvedDate?: string | null;
  readonly isApproved: boolean;
}

export interface EmployeeSummary {
  readonly localNow: string;
  readonly localDate: string;
  readonly timeZone: string;
  readonly attendanceStatus: string;
  readonly canCheckIn: boolean;
  readonly canCheckOut: boolean;
  readonly isNonWorkingDay: boolean;
  readonly vacationBalanceDays: number;
  readonly pendingVacationRequests: number;
  readonly employee: EmployeeProfileSummary;
  readonly todayShift?: EmployeeShiftSummary | null;
  readonly todayAttendance?: EmployeeAttendanceSnapshot | null;
  readonly latestAttendanceRecords: readonly EmployeeAttendanceSnapshot[];
  readonly recentIncidents: readonly EmployeeIncidentSummary[];
}
