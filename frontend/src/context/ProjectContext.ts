import { createContext } from 'react';
import type { Project } from '../types/project.types';

export interface ProjectContextType {
  project: Project | null;
}

export const defaultProject: ProjectContextType = {
  project: null,
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
