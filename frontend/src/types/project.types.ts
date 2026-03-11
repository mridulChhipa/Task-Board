import type { Workflow } from './boards.types';

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
  workflows: Workflow[];
}
