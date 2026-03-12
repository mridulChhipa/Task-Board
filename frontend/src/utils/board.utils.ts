import type { Board } from '../types/project.types';

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
    throw new Error("Can't fetch project at the moment", { cause: err });
  }
}

export async function addWorkflow(
  boardId: string,
  name: string,
  orderIdx: number,
  projectId: string,
  limit: number,
): Promise<Board> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/project/${projectId}/board/add-column/${boardId}`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
    const board: Board = data.board;

    return board;
  } catch (err) {
    throw new Error("Can't fetch project at the moment", { cause: err });
  }
}
