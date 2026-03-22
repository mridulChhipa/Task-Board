import type { User } from '../context/AuthContext';
import type { CommentDTO, ThreadDTO } from './comment.types';
import type { Board } from './project.types';

export type ActivityType =
  | 'TASK_STATUS_UPDATED'
  | 'TASK_ASSIGNEE_CHANGED'
  | 'COMMENT_ADDED'
  | 'COMMENT_EDITED'
  | 'COMMENT_DELETED'
  | 'THREAD_ADDED'
  | 'THREAD_EDITED'
  | 'THREAD_DELETED';

export interface Workflow {
  id: string;
  name: string;
  orderIdx: number;
  boardId: string;
  limit: number;
  tasks: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'STORY' | 'TASK' | 'BUG';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignee: number;
  reporter: number;
  dueDate?: Date;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  parentId?: string;
  threads?: ThreadDTO[];
  activities?: ActivityDTO[];
  children: string[];
}

export interface ActivityDTO {
  id: string;
  type: ActivityType;
  timestamp: string; // Using string because Dates become ISO strings when sent via JSON
  metadata: {
    thread?: ThreadDTO;
    comment?: CommentDTO;
    oldStatus?: Workflow;
    newStatus?: Workflow;
    oldAssignee?: User;
    newAssignee?: User;
    user?: User;
  };
}

export interface EdgeConstraint {
  id: string;
  boardId: string;
  board?: Board;
  uId: string;
  u?: Workflow;
  vId: string;
  v?: Workflow;
}

export interface ProjectMember {
  userId: number;
}

export type TaskType = 'STORY' | 'TASK' | 'BUG';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
