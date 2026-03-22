import type { Priority, Task, Workflow } from '../types/boards.types';
import type { Board } from '../types/project.types';

const priorityRank: Record<Priority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export async function fetchBoard(
  bid: string,
  projectId: string,
): Promise<Board> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/project/${projectId}/board/${bid}`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    const board: Board = data.board;

    return board;
  } catch (err) {
    throw new Error("Can't fetch project at the moment[fetchboard]", {
      cause: err,
    });
  }
}

export async function addWorkflow(
  boardId: string,
  name: string,
  orderIdx: number,
  projectId: string,
  limit: number,
): Promise<Workflow> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/project/${projectId}/board/add-column/${boardId}`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          boardId,
          name,
          orderIdx,
          limit,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    const column: Workflow = data.column;

    return column;
  } catch (err) {
    throw new Error("Can't create column at the moment", { cause: err });
  }
}

export async function sortWorkflows(
  workflows: Workflow[],
  onError: (msg: string) => void = () => {},
  taskCache: Record<string, Task> = {},
): Promise<Workflow[]> {
  console.log('Sorting workflows');
  async function getTaskMeta(taskId: string) {
    const cached = taskCache[taskId];
    if (cached) {
      return {
        date: cached.dueDate ? new Date(cached.dueDate) : null,
        priority: cached.priority as Priority,
      };
    }
    try {
      const res = await fetch(`http://localhost:3000/api/task/${taskId}`, {
        credentials: 'include',
      });
      const resJson = await res.json();
      return {
        date: resJson.task.dueDate ? new Date(resJson.task.dueDate) : null,
        priority: resJson.task.priority as Priority,
      };
    } catch (err) {
      onError('Could not fetch task details for sorting');
      throw new Error('Error fetching task details', { cause: err });
    }
  }
  console.log(workflows);
  const workflowTasks = await Promise.all(
    workflows.map(async (workflow) =>
      Promise.all(
        workflow.tasks.map(async (taskId) => {
          const taskMeta = await getTaskMeta(taskId);
          return {
            taskId,
            date: taskMeta.date,
            priority: taskMeta.priority,
          };
        }),
      ),
    ),
  );

  const sortedTaskLists = workflowTasks.map((tasks) => {
    return tasks.sort((a, b) => {
      if (a.date && b.date) {
        const dayDiff = Math.round(
          (a.date.getTime() - b.date.getTime()) / (1000 * 3600 * 24),
        );

        if (dayDiff !== 0) {
          return dayDiff;
        }

        return priorityRank[a.priority] - priorityRank[b.priority];
      }

      if (a.date && !b.date) {
        return -1;
      }

      if (!a.date && b.date) {
        return 1;
      }

      return priorityRank[a.priority] - priorityRank[b.priority];
    });
  });

  return workflows.map((workflow, idx) => ({
    ...workflow,
    tasks: sortedTaskLists[idx].map((task) => task.taskId),
  }));
}

export { createBoardHandlers } from './board.handlers';
export type { BoardHandlers } from './board.handlers';
