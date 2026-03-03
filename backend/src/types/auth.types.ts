export enum TokenType {
  ACCESS,
  REFRESH,
}

export interface JWTPayload {
  sub: number;
  iss: string; // Issuer
  jti: string; // Refresh_token -> id
  type: TokenType;
  email: string;
  role: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}
