export interface Project {
  id: string;
  name: string;
  description: string;
  // createdAt: string;
  // lastModified: string;
  role: string;
  isArchived: boolean;
  members: number[];
}
