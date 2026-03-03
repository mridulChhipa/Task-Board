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
  projectId: string;
  name: string;
  description: string;
}

export interface ArchiveBody {
  projectId: string;
  isArchived: boolean;
}

export interface AssignUserBody {
  projectId: string;
  userId: number;
  role: ProjectLevelRole;
}

export interface RemoveUserBody {
  projectId: string;
  userId: number;
}

export interface UpdateRoleBody {
  projectId: string;
  userId: number;
  role: ProjectLevelRole;
}
