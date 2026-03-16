import type { ThreadDTO } from './comment.types';

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
  resolvedAt?: Date;
  closedAt?: string;
  parentId?: string;
  threads?: ThreadDTO[];
  activities?: ActivityDTO[];
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