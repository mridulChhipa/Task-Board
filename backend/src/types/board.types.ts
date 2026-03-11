import { TaskDTO } from './task.types';

export interface BoardDTO {
  id: string;
  name: string;
  projectId: string;
  columns: ColumnDTO[];
}

export interface ColumnDTO {
  id: string;
  name: string;
  boardId: string;
  limit: number;
  orderIdx: number;
  tasks?: string[];
}
