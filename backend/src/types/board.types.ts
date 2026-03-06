export interface BoardDTO {
  id: string;
  name: string;
  projectId: string;
  columns: string[];
}

export interface ColumnDTO {
  id: string;
  name: string;
  boardId: string;
  limit: number;
  orderIdx: number;
}
