import { ThreadDTO } from "./comment.types";

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
