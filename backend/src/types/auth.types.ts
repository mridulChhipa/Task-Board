import type { Request } from 'express';
import type { ProjectDetails } from './project.types';
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
}

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface UserDetails {
  name: string;
  email: string;
  avatar: string | null;
}

export interface UserWithProjs {
  personalData: UserDetails;
  projectData: ProjectDetails[];
}
