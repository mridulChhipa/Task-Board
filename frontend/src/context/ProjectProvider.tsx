import { useReducer, type ReactNode } from 'react';
import {
  defaultProject,
  ProjectContext,
  ProjectDispatchContext,
  projectReducer,
} from './ProjectContext';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectData, dispatch] = useReducer(projectReducer, defaultProject);

  return (
    <ProjectDispatchContext.Provider value={dispatch}>
      <ProjectContext.Provider value={projectData}>
        {children}
      </ProjectContext.Provider>
    </ProjectDispatchContext.Provider>
  );
}
