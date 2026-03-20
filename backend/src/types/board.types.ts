export interface BoardDTO {
  id: string;
  name: string;
  projectId: string;
  workflows: ColumnDTO[];
  edgeConstraints: EdgeConstraintDTO[];
}

export interface ColumnDTO {
  id: string;
  name: string;
  boardId: string;
  limit: number;
  orderIdx: number;
  tasks?: string[];
}

export interface EdgeConstraintDTO {
  id: String;
  boardId: String;
  board?: BoardDTO;
  uId: String;
  u?: ColumnDTO;
  vId: String;
  v?: ColumnDTO;
}
