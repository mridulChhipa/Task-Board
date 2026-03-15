import type { ThreadDTO } from './comment.types';

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
  // stackPosition: number;
  dueDate?: Date;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: string;
  parentId?: string;
  threads?: ThreadDTO[];
}
