import { EmployeeProfileSummary } from '../../dashboard/models/employee-summary.model';

export interface EmployeeProfile {
  readonly localNow: string;
  readonly localDate: string;
  readonly timeZone: string;
  readonly employee: EmployeeProfileSummary;
}
