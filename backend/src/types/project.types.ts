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
  userId: number;
  role: ProjectLevelRole;
}

export interface RemoveUserBody {
  userId: number;
}

export interface UpdateRoleBody {
  userId: number;
  role: ProjectLevelRole;
}

export interface Member {
  id: number;
  name: Member;
}

export interface ProjectDetails {
  id: string;
  name: string;
  description: string | null;
  role?: ProjectRole;
  members: number[];
  isArchived: boolean;
}
