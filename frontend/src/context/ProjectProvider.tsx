import { useEffect, useReducer, type ReactNode } from 'react';
import {
  defaultProject,
  ProjectContext,
  ProjectDispatchContext,
  projectReducer,
} from './ProjectContext';
import { useParams } from 'react-router-dom';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectData, dispatch] = useReducer(projectReducer, defaultProject);
  const { pid } = useParams();

  useEffect(() => {
    async function fetchProj() {
      try {
        await fetch(`http://localhost:3000/api/project/${pid}`, {
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((resJson) => {
            const project = resJson.data;
            dispatch({
              type: 'FETCH_PROJ',
              payload: {
                project,
                isLoading: false,
              },
            });
          });
      } catch (err) {
        console.log('Could not restore user', err);

        dispatch({
          type: 'REFRESH_FAILURE',
          payload: { ...defaultProject, isLoading: false },
        });
      }
    }

    fetchProj();

  }, [pid]);

  return (
    <ProjectDispatchContext.Provider value={dispatch}>
      <ProjectContext.Provider value={projectData}>
        {children}
      </ProjectContext.Provider>
    </ProjectDispatchContext.Provider>
  );
}
