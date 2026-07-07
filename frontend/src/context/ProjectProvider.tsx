import { API_URL } from '../config';
import { useEffect, useReducer, type ReactNode } from 'react';
import {
  defaultProject,
  ProjectContext,
  ProjectDispatchContext,
  projectReducer,
} from './ProjectContext';
import { useParams } from 'react-router-dom';
import type { Board, Project } from '../types/project.types';
import type { Task, Workflow } from '../types/boards.types';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectData, dispatch] = useReducer(projectReducer, defaultProject);
  const { pid } = useParams();

  useEffect(() => {
    let cancelled = false;

    async function fetchProj() {
      try {
        await fetch(`${API_URL}/api/project/${pid}`, {
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((resJson) => {
            if (cancelled) {
              return;
            }
            const projData = resJson.data;
            const project: Project = {
              ...projData,
              boards: [],
            };
            const taskCache: Record<string, Task> = {};
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
                  taskCache[task.id] = {
                    ...task,
                    children: (task.children ?? []).map(
                      (child: { id: string }) => child.id,
                    ),
                  };
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
                taskCache,
              },
            });
          });
      } catch (err) {
        if (cancelled) {
          return;
        }
        console.error('Could not fetch project', err);

        dispatch({
          type: 'REFRESH_FAILURE',
          payload: { ...defaultProject, isLoading: false },
        });
      }
    }

    fetchProj();

    return () => {
      cancelled = true;
    };
  }, [pid]);

  return (
    <ProjectDispatchContext.Provider value={dispatch}>
      <ProjectContext.Provider value={projectData}>
        {children}
      </ProjectContext.Provider>
    </ProjectDispatchContext.Provider>
  );
}
