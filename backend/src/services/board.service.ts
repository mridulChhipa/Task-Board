import { db } from '../config/db';

export class BoardService {
  async create(projectId: string, name: string): Promise<void> {
    try {
      const createdBoard = await db.board.create({
        data: {
          projectId,
          name,
        },
      });

      /*
      Need to find a mechanism so that if creation of let
      say second def-workflow fails then it removes the already created two 
      */
      const defaultWorkflows = ['To Do', 'In Progress', 'Review', 'Done'];
      for (const defWorkflow of defaultWorkflows) {
        await db.workflow.create({
          data: {
            name: defWorkflow,
            orderIdx: 1000000,
            boardId: createdBoard.id,
          },
        });
      }
    } catch (error) {
      console.log('Board Creation failed: ', error);
      throw error;
    }
  }

  async update(
    boardId: string /*, projectId: string*/,
    name: string,
  ): Promise<void> {
    try {
      const existingBoard = await db.board.findFirst({
        where: {
          id: boardId,
        },
      });

      if (!existingBoard) {
        throw new Error('Trying to update non-existent board');
      }

      // if (existingBoard.projectId !== projectId) {
      //   throw new Error('This board does not exists in this project');
      // }

      await db.board.update({
        data: {
          name,
        },
        where: {
          id: boardId,
        },
      });
    } catch (error) {
      console.log('Board Updation failed: ', error);
      throw error;
    }
  }

  async addColumn(
    boardId: string,
    columnName: string,
    limit: number,
  ): Promise<void> {
    try {
      await db.workflow.create({
        data: {
          boardId,
          name: columnName,
          orderIdx: 1000000,
          limit,
        },
      });
    } catch (error) {
      console.log('Adding column...Failed with: ', error);
      throw error;
    }
  }

  async updateColumn(
    columnId: string,
    boardId: string,
    columnName: string,
    limit: number,
    position: number,
  ): Promise<void> {
    try {
      const existingColumn = await db.workflow.findFirst({
        where: {
          id: columnId,
        },
      });

      if (!existingColumn) {
        throw new Error('Non-existent column');
      }

      if (existingColumn.boardId !== boardId) {
        throw new Error('This column does not exists in this board');
      }

      await db.workflow.update({
        data: {
          name: columnName,
          orderIdx: position,
          limit,
        },
        where: {
          id: columnId,
        },
      });
    } catch (error) {
      console.log('Adding column...Failed with: ', error);
      throw error;
    }
  }

  async deleteColumn(columnId: string, boardId: string): Promise<void> {
    try {
      const existingColumn = await db.workflow.findFirst({
        where: {
          id: columnId,
        },
      });

      if (!existingColumn) {
        throw new Error('Non-existent column');
      }

      if (existingColumn.boardId !== boardId) {
        throw new Error('This board does not exists in this project');
      }

      await db.workflow.delete({
        where: {
          id: columnId,
        },
      });
    } catch (error) {
      console.log('Column Deletion...Failed with: ', error);
      throw error;
    }
  }

  async deleteBoard(boardId: string): Promise<void> {
    try {
      await db.board.delete({
        where: {
          id: boardId,
        },
      });
    } catch (error) {
      console.log('Board Deletions...Failed with: ', error);
      throw error;
    }
  }
}

export const boardService = new BoardService();
