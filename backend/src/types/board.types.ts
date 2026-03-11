export interface BoardDTO {
  id: string;
  name: string;
  projectId: string;
  workflows: ColumnDTO[];
}

export interface ColumnDTO {
  id: string;
  name: string;
  boardId: string;
  limit: number;
  orderIdx: number;
  tasks?: string[];
}
