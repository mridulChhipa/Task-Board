import { createContext } from 'react';
import type { Project } from '../types/project.types';
import type { Task } from '../types/boards.types';

export interface ProjectContextType {
  project: Project | null;
  isLoading: boolean;
  /** Tasks bundled with the project fetch, keyed by id. */
  taskCache: Record<string, Task>;
}

export const defaultProject: ProjectContextType = {
  project: null,
  isLoading: true,
  taskCache: {},
};

export const ProjectContext = createContext(defaultProject);

export interface ProjectDispatchType {
  type: string;
  payload: ProjectContextType;
}

export const ProjectDispatchContext = createContext<
  React.Dispatch<ProjectDispatchType>
>(() => {});

export function projectReducer(
  state: ProjectContextType,
  action: ProjectDispatchType,
): ProjectContextType {
  void state;
  return { ...action.payload };
}
