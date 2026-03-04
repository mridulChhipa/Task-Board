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

export interface TaskBody {
  title: string;
  type: TaskType;
  description: string;
  priority: PriorityType;
  assignee: number;
  reporter: number;
  dueDate: Date;
  stackPosition: number;
  statusId: string; // -> workflow.id
}
