export interface AuthLoginRequest {
  readonly email: string;
  readonly password: string;
  readonly companyIdHint?: string | null;
}
