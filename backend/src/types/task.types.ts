import { ThreadDTO } from './comment.types';

export enum TaskType {
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
}

export enum PriorityType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ActivityType {
  TASK_STATUS_UPDATED = 'TASK_STATUS_UPDATED',
  TASK_ASSIGNEE_CHANGED = 'TASK_ASSIGNEE_CHANGED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_EDITED = 'COMMENT_EDITED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  THREAD_ADDED = 'THREAD_ADDED',
  THREAD_EDITED = 'THREAD_EDITED',
  THREAD_DELETED = 'THREAD_DELETED',
}

export interface CreateTaskBody {
  title: string;
  type: TaskType;
  description: string | null;
  priority: PriorityType;
  assignee: number;
  reporter: number;
  dueDate: Date;
  statusId: string;
  parentId: string | null;
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  priority: PriorityType;
  assignee: number;
  reporter: number;
  dueDate: Date | null;
  statusId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  children: string[];
  threads: ThreadDTO[];
  activities: ActivityDTO[];
}

export interface TaskResponseBody {
  id: string;
  title: string;
  type: TaskType;
  description: string;
  priority: PriorityType;
  assignee: number;
  reporter: number;
  dueDate: Date;
  statusId: string;
  parentId: string | null;
  children: TaskResponseBody[];
}

export interface ActivityDTO {
  id: string;
  type: ActivityType;
  timestamp: string; // Using string because Dates become ISO strings when sent via JSON
  metadata: {
    threadId?: string | null;
    commentId?: string | null;
    oldStatusId?: string | null;
    newStatusId?: string | null;
    oldAssignee?: number | null;
    newAssignee?: number | null;
  };
}
