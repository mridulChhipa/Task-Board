import type { ProjectLevelRole } from '../../generated/prisma/enums';

export enum ProjectRole {
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  PROJECT_MEMBER = 'PROJECT_MEMBER',
  PROJECT_VIEWER = 'PROJECT_VIEWER',
}

export enum GlobalRole {
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
  USER = 'USER',
}

export interface CreateBody {
  name: string;
  description: string;
}

export interface UpdateBody {
  name: string;
  description: string;
  isArchived: boolean;
}

export interface ArchiveBody {
  isArchived: boolean;
}

export interface AssignUserBody {
  userMail: string;
  role: ProjectLevelRole;
}

export interface RemoveUserBody {
  userMail: string;
}

export interface UpdateRoleBody {
  userMail: string;
  role: ProjectLevelRole;
}

export interface ProjectDetails {
  id: string;
  name: string;
  description: string | null;
  role?: ProjectRole;
  members: number[];
  isArchived: boolean;
}
