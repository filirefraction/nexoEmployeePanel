export interface VacationRequestListItem {
  readonly id: string;
  readonly employeeId: string;
  readonly vacationRequestStatusId: string;
  readonly vacationRequestStatusName: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly requestedDays: number;
  readonly requestedDate: string;
  readonly isApproved: boolean;
  readonly isRejected: boolean;
  readonly canCancel: boolean;
}

export interface VacationRequest {
  readonly id: string;
  readonly employeeId: string;
  readonly vacationRequestStatusId: string;
  readonly vacationRequestStatusName: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly requestedDays: number;
  readonly reason?: string | null;
  readonly requestedDate: string;
  readonly approvedByUserId?: string | null;
  readonly approvedDate?: string | null;
  readonly rejectedByUserId?: string | null;
  readonly rejectedDate?: string | null;
  readonly rejectedReason?: string | null;
  readonly isApproved: boolean;
  readonly isRejected: boolean;
  readonly canCancel: boolean;
}

export interface VacationRequestFilter {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly fromDate?: string | null;
  readonly toDate?: string | null;
}

export interface VacationRequestCreateRequest {
  readonly fromDate: string;
  readonly toDate: string;
  readonly reason?: string | null;
}
