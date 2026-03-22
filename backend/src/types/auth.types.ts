import type { Request } from 'express';
import type { ProjectDetails } from './project.types';
import type { NotificationDTO } from './notifcation.types';

// export enum TokenType {
//   ACCESS = 'ACCESS',
//   REFRESH = 'REFRESH',
// }

export enum TokenType {
  ACCESS,
  REFRESH,
}

export interface JWTPayload {
  sub: number; // userId
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
  userId: number;
}

export interface UserDetails {
  userId: number;
  name: string;
  email: string;
  avatar: string | null;
  globalRole: string;
}

export interface CompleteUser {
  personalData: UserDetails;
  projectData: ProjectDetails[];
  notifications: NotificationDTO[];
}
