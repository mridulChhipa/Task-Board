import type { EdgeConstraint, Workflow } from './boards.types';

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  isArchived: boolean;
  members: Member[];
  boards: Board[];
}

export interface Member {
  id: string;
  projectId: string;
  role: string;
  userId: number;
}

export interface Board {
  id: string;
  name: string;
  projectId: string;
  workflows: Workflow[];
  edges: EdgeConstraint[];
}
