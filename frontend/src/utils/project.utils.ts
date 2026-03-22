import type { Board, Project, Member } from '../types/project.types';

interface IncomingProject {
  id: string;
  name: string;
  description: string;
  // createdAt: string;
  // lastModified: string;
  role: string;
  isArchived: boolean;
  members: Member[];
  boards: Board[];
}

export async function fetchProject(pid: string): Promise<Project> {
  try {
    const response = await fetch(`http://localhost:3000/api/project/${pid}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    const {
      id,
      name,
      description,
      isArchived,
      members,
      boards,
    }: IncomingProject = data.data;
    const project: Project = {
      id,
      name,
      description,
      isArchived,
      role: 'PROJECT_MEMBER',
      members,
      boards,
    };
    return project;
  } catch (err) {
    throw new Error("Can't fetch project at the moment", { cause: err });
  }
}
