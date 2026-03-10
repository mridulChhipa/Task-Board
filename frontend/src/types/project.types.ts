export interface Project {
  id: string;
  name: string;
  description: string;
  // createdAt: string;
  // lastModified: string;
  role: string;
  isArchived: boolean;
  members: number[];
  boards: Board[];
}

export interface Board {
  id: string;
  name: string;
  projectId: string;
  // workflows Workflow[]
}

export interface Workflow {
  id: string;
  name: string;
  orderIdx: number;
  boardId: string;
  limit: number;
  tasks: Task[];
}

export interface Task {
  id: string;
}
