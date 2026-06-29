export interface AuthChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
}
