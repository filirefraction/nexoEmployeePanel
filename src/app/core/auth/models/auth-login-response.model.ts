import { AuthCompanyOption } from './auth-company-option.model';
import { CurrentUser } from './current-user.model';

export interface AuthLoginResponse {
  readonly requiresCompanySelection: boolean;
  readonly companies: readonly AuthCompanyOption[];
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly accessTokenExpiresAtUtc: string | null;
  readonly refreshTokenExpiresAtUtc: string | null;
  readonly user: CurrentUser | null;
}
