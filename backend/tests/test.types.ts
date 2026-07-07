/**
 * Test Types - Types for mocking and testing
 * Contains Prisma operation argument types and service DTOs
 */

import type { GlobalRole, ProjectRole } from '../src/types/project.types';
import type { NotifType } from '../src/types/notification.types';
import type { TaskType, PriorityType } from '../src/types/task.types';

// ============ Prisma Argument Types ============

// User Operations
export interface UserCreateArgs {
  data: {
    name: string;
    email: string;
    password: string;
    avatar?: string | null;
    globalRole: GlobalRole;
  };
}

export interface UserFindUniqueArgs {
  where: {
    email?: string;
    id?: number;
  };
}

export interface UserUpdateArgs {
  where: {
    email?: string;
    id?: number;
  };
  data: {
    name?: string;
    email?: string;
    avatar?: string | null;
    globalRole?: GlobalRole;
  };
}

// Session Operations
export interface SessionCreateArgs {
  data: {
    id: string;
    userId: number;
    token: string;
    expiresAt: Date;
  };
}

export interface SessionFindUniqueArgs {
  where: {
    id: string;
  };
}

export interface SessionUpdateArgs {
  where: {
    id: string;
  };
  data: {
    token?: string;
    expiresAt?: Date;
  };
}

export interface SessionDeleteArgs {
  where: {
    id: string;
  };
}

// Board Operations
export interface BoardCreateArgs {
  data: {
    name: string;
    projectId: string;
  };
}

export interface BoardFindFirstArgs {
  where: {
    id?: string;
    projectId?: string;
  };
}

export interface BoardUpdateArgs {
  where: {
    id: string;
  };
  data: {
    name?: string;
  };
}

// Workflow/Column Operations
export interface WorkflowCreateArgs {
  data: {
    name: string;
    boardId: string;
    orderIdx: number;
    limit?: number;
  };
}

export interface WorkflowFindFirstArgs {
  where: {
    id?: string;
    boardId?: string;
  };
}

export interface WorkflowUpdateArgs {
  where: {
    id: string;
  };
  data: {
    name?: string;
    orderIdx?: number;
    limit?: number;
  };
}

export interface WorkflowDeleteArgs {
  where: {
    id: string;
  };
}

// Task Operations
export interface TaskCreateArgs {
  data: {
    id?: string;
    title: string;
    description?: string | null;
    type: TaskType;
    priority: PriorityType;
    assignee?: number | null;
    reporter: number;
    dueDate?: Date | null;
    statusId: string;
    parentId?: string | null;
    resolvedAt?: Date | null;
    closedAt?: Date | null;
  };
}

export interface TaskFindUniqueArgs {
  where: {
    id: string;
  };
}

export interface TaskFindManyArgs {
  where: {
    statusId?: string;
    parentId?: string | null;
    [key: string]: unknown;
  };
}

export interface TaskUpdateArgs {
  where: {
    id: string;
  };
  data: {
    title?: string;
    description?: string | null;
    type?: TaskType;
    priority?: PriorityType;
    assignee?: number | null;
    dueDate?: Date | null;
    statusId?: string;
    resolvedAt?: Date | null;
    closedAt?: Date | null;
  };
}

export interface TaskDeleteArgs {
  where: {
    id: string;
  };
}

// Notification Operations
export interface NotificationCreateArgs {
  data: {
    senderId: number;
    recipientId: number;
    taskId?: string | null;
    commentId?: string | null;
    threadId?: string | null;
    type: NotifType;
  };
}

export interface NotificationFindUniqueArgs {
  where: {
    id: string;
  };
}

export interface NotificationUpdateArgs {
  where: {
    id: string;
  };
  data: {
    read?: boolean;
  };
}

export interface NotificationDeleteArgs {
  where: {
    id: string;
  };
}

// Thread Operations
export interface ThreadCreateArgs {
  data: {
    title: string;
    content?: string | null;
    taskId: string;
    authorId: number;
    isDeleted: boolean;
  };
}

export interface ThreadUpdateArgs {
  where: {
    id: string;
  };
  data: {
    title?: string;
    content?: string | null;
    isDeleted?: boolean;
  };
}

// Comment Operations
export interface CommentCreateArgs {
  data: {
    content: string;
    threadId: string;
    authorId: number;
    isDeleted: boolean;
    parentId?: string | null;
  };
}

export interface CommentUpdateArgs {
  where: {
    id: string;
  };
  data: {
    content?: string;
    isDeleted?: boolean;
  };
}

export interface CommentDeleteArgs {
  where: {
    id: string;
  };
}

// Activity Operations
export interface ActivityCreateArgs {
  data: {
    type: string;
    taskId?: string;
    createdBy: number;
    [key: string]: unknown;
  };
}

// Project Operations
export interface ProjectCreateArgs {
  data: {
    name: string;
    description?: string | null;
    isArchived?: boolean;
  };
}

export interface ProjectFindUniqueArgs {
  where: {
    id: string;
  };
}

export interface ProjectUpdateArgs {
  where: {
    id: string;
  };
  data: {
    name?: string;
    description?: string | null;
    isArchived?: boolean;
  };
}

// ProjectMember Operations
export interface ProjectMemberCreateArgs {
  data: {
    userId: number;
    projectId: string;
    role: ProjectRole;
  };
}

export interface ProjectMemberDeleteArgs {
  where: {
    userId_projectId: {
      userId: number;
      projectId: string;
    };
  };
}

export interface ProjectMemberUpdateArgs {
  where: {
    userId_projectId: {
      userId: number;
      projectId: string;
    };
  };
  data: {
    role?: ProjectRole;
  };
}

// EdgeConstraint Operations
export interface EdgeConstraintCreateArgs {
  data: {
    boardId: string;
    uId: string;
    vId: string;
  };
}

export interface EdgeConstraintDeleteArgs {
  where: {
    id: string;
  };
}

// ============ DTO Types ============

export interface NotificationDTO {
  id: string;
  senderId: number;
  recipientId: number;
  taskId: string | null;
  commentId: string | null;
  threadId: string | null;
  type: NotifType;
  read: boolean;
  recipientName: string;
  senderName: string;
  recipient?: {
    id: number;
    name: string;
  };
  sender?: {
    id: number;
    name: string;
  };
}

export interface ThreadCreatePayload {
  taskId: string;
  title: string;
  content?: string;
  authorId: number;
  isDeleted: boolean;
}

export interface CommentCreatePayload {
  threadId: string;
  content: string;
  authorId: number;
  isDeleted: boolean;
  parentId?: string | null;
}

export interface CreateNotificationPayload {
  recipientId: number;
  senderId: number;
  taskId?: string | null;
  commentId?: string | null;
  threadId?: string | null;
  type: NotifType;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  type: TaskType;
  priority: PriorityType;
  assignee?: number | null;
  reporter: number;
  dueDate?: Date | null;
  statusId: string;
  parentId?: string | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
}

export interface ProjectDTO {
  id: string;
  name: string;
  description?: string | null;
  isArchived?: boolean;
  members?: Array<{
    userId?: number;
    role?: ProjectRole;
  }>;
}

export interface UserModel {
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar?: string | null;
  globalRole?: GlobalRole;
  projects?: Array<{
    projectId: string;
    role: ProjectRole;
  }>;
  notifications?: unknown[];
}

export interface SessionModel {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  user?: {
    id: number;
    email: string;
  };
}

export interface TaskModel {
  id: string;
  title: string;
  description?: string | null;
  type: TaskType;
  priority: PriorityType;
  assignee?: number | null;
  reporter: number;
  dueDate?: Date | null;
  statusId: string;
  parentId?: string | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  [key: string]: unknown;
}

export interface BoardModel {
  id: string;
  name: string;
  projectId: string;
  workflows?: unknown[];
}

export interface WorkflowModel {
  id: string;
  name: string;
  boardId: string;
  orderIdx: number;
  limit?: number;
  tasks?: string[];
}

export interface ThreadModel {
  id: string;
  title: string;
  content?: string | null;
  taskId: string;
  authorId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentModel {
  id: string;
  content: string;
  threadId: string;
  authorId: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  thread?: {
    title: string;
  };
  author?: {
    name: string;
  };
}

export interface ProjectModel {
  id: string;
  name: string;
  description?: string | null;
  isArchived: boolean;
  members?: Array<{
    userId: number;
    role: ProjectRole;
  }>;
}

export interface EdgeConstraintModel {
  id: string;
  boardId: string;
  uId: string;
  vId: string;
}

export interface ActivityModel {
  id: string;
  type: string;
  taskId?: string;
  createdBy: number;
  [key: string]: unknown;
}

// ============ Generic Argument Type ============

export type PrismaArgument =
  | UserCreateArgs
  | UserFindUniqueArgs
  | UserUpdateArgs
  | SessionCreateArgs
  | SessionFindUniqueArgs
  | SessionUpdateArgs
  | SessionDeleteArgs
  | BoardCreateArgs
  | BoardFindFirstArgs
  | BoardUpdateArgs
  | WorkflowCreateArgs
  | WorkflowFindFirstArgs
  | WorkflowUpdateArgs
  | WorkflowDeleteArgs
  | TaskCreateArgs
  | TaskFindUniqueArgs
  | TaskFindManyArgs
  | TaskUpdateArgs
  | TaskDeleteArgs
  | NotificationCreateArgs
  | NotificationFindUniqueArgs
  | NotificationUpdateArgs
  | NotificationDeleteArgs
  | ThreadCreateArgs
  | ThreadUpdateArgs
  | CommentCreateArgs
  | CommentUpdateArgs
  | CommentDeleteArgs
  | ActivityCreateArgs
  | ProjectCreateArgs
  | ProjectFindUniqueArgs
  | ProjectUpdateArgs
  | ProjectMemberCreateArgs
  | ProjectMemberDeleteArgs
  | ProjectMemberUpdateArgs
  | EdgeConstraintCreateArgs
  | EdgeConstraintDeleteArgs;
