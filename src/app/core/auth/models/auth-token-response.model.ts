import { CurrentUser } from './current-user.model';

export interface AuthTokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAtUtc: string;
  readonly refreshTokenExpiresAtUtc: string;
  readonly user: CurrentUser;
}
