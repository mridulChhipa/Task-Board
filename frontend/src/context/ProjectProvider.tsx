import { useEffect, useReducer, type ReactNode } from 'react';
import {
  defaultProject,
  ProjectContext,
  ProjectDispatchContext,
  projectReducer,
} from './ProjectContext';
import { useParams } from 'react-router-dom';
import type { Board, Project } from '../types/project.types';
import type { Workflow } from '../types/boards.types';

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
            const projData = resJson.data;
            const project: Project = {
              ...projData,
              boards: [],
            };
            for (const boardData of projData.boards) {
              const board: Board = {
                ...boardData,
                workflows: [],
                edges: boardData.edgeConstraints ?? [],
              };

              for (const workflowData of boardData.workflows) {
                const workflow: Workflow = {
                  ...workflowData,
                  tasks: [],
                };

                for (const task of workflowData.tasks) {
                  workflow.tasks.push(task.id);
                }

                board.workflows.push(workflow);
              }

              project.boards.push(board);
            }

            // console.log(project);
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
