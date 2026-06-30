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
export interface VacationRequestDay {
  readonly date: string;
  readonly dayOfWeek: string;
  readonly countsAsVacationDay: boolean;
  readonly description: string;
  readonly sortOrder: number;
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
  readonly days: readonly VacationRequestDay[];
}
export interface VacationRequestFilter {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly fromDate?: string | null;
  readonly toDate?: string | null;
}
export interface VacationRequestCreateRequest {
  readonly fromDate: string;
  readonly requestedDays: number;
  readonly reason?: string | null;
}
export interface VacationRequestPreviewRequest {
  readonly fromDate: string;
  readonly requestedDays: number;
}
export interface VacationRequestPreviewDay {
  readonly date: string;
  readonly dayOfWeek: string;
  readonly countsAsVacationDay: boolean;
  readonly description: string;
}
export interface VacationRequestPreview {
  readonly fromDate: string;
  readonly toDate: string;
  readonly requestedDays: number;
  readonly countedVacationDays: number;
  readonly returnToWorkDate: string;
  readonly days: readonly VacationRequestPreviewDay[];
}