export interface CurrentUser {
  readonly id: string;
  readonly companyId?: string | null;
  readonly isImpersonating: boolean;
  readonly originalUserId?: string | null;
  readonly impersonationLogId?: string | null;
  readonly employeeId?: string | null;
  readonly email: string;
  readonly displayName: string;
  readonly isEmailConfirmed: boolean;
  readonly mfaEnabled: boolean;
  readonly isActive: boolean;
  readonly lastLoginDate?: string | null;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}
