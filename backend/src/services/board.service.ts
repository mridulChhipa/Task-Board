import { EdgeConstraint } from '../../generated/prisma/client';
import { db } from '../config/db';
import type { BoardDTO, ColumnDTO, EdgeConstraintDTO } from '../types/board.types';

export class BoardService {
  async create(projectId: string, name: string): Promise<BoardDTO> {
    try {
      console.log('Creating board with name: ', name, ' for projectId: ', projectId);
      
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
      const defaultWorkflows = [
        { name: 'To Do', order: 0 },
        { name: 'In Progress', order: 1 },
        { name: 'Review', order: 2 },
        { name: 'Done', order: 3 },
      ];

      const createdWorkflows = [];
      for (const defWorkflow of defaultWorkflows) {
        const createdWorkflow = await db.workflow.create({
          data: {
            name: defWorkflow.name,
            orderIdx: defWorkflow.order,
            boardId: createdBoard.id,
            limit: defWorkflow.name === 'In Progress' ? 5 : -1,
          },
        });
        createdWorkflows.push(createdWorkflow);
      }

      const board: BoardDTO = {
        id: createdBoard.id,
        name: createdBoard.name,
        projectId: createdBoard.projectId,
        workflows: createdWorkflows.map((workflow) => ({
          id: workflow.id,
          name: workflow.name,
          boardId: workflow.boardId,
          limit: workflow.limit,
          orderIdx: workflow.orderIdx,
        })),
        edgeConstraints: [],
      };
      return board;
    } catch (error) {
      throw new Error('Error creating Board: ', { cause: error });
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
      throw new Error('Board Updation failed: ', { cause: error });
    }
  }

  async addColumn(
    boardId: string,
    name: string,
    limit: number,
    orderIdx: number,
  ): Promise<ColumnDTO> {
    try {
      const createdColumn = await db.workflow.create({
        data: {
          boardId,
          name,
          orderIdx,
          limit,
        },
      });

      return createdColumn;
    } catch (error) {
      throw new Error('Error adding workflow/column: ', { cause: error });
    }
  }

  async updateColumn(
    columnId: string,
    boardId: string,
    columnName: string,
    limit: number,
    orderIdx: number,
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
          orderIdx,
          limit,
        },
        where: {
          id: columnId,
        },
      });
    } catch (error) {
      throw new Error('Adding column...Failed with: ', { cause: error });
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
      throw new Error('Column Deletion...Failed with: ', { cause: error });
    }
  }

  async addEdge(boardId: string, sourceColId: string, targetColId: string): Promise<EdgeConstraintDTO> {
    try {
      console.log('Adding edge with sourceColId: ', sourceColId, ' and targetColId: ', targetColId);
      const existingBoard = await db.board.findFirst({
        where: {
          id: boardId,
        },
      });

      if (!existingBoard) {
        throw new Error('Trying to add edge to non-existent board');
      }

      const newEdge = await db.edgeConstraint.create({
        data: {
          boardId,
          uId: sourceColId,
          vId: targetColId,
        },
      });
      
      const edge: EdgeConstraintDTO = {
        id: newEdge.id,
        boardId: newEdge.boardId,
        uId: newEdge.uId,
        vId: newEdge.vId,
      };

      return edge;
    } catch (error) {
      throw new Error('Failed to add edge: ', { cause: error });
    }
  }

  async deleteEdge(boardId: string, edgeId: string): Promise<void> {
    try {
      await db.edgeConstraint.delete({
        where: {
          id: edgeId,
        },
      });
    } catch (error) {
      throw new Error('Failed to delete edge: ', { cause: error });
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
      throw new Error('Board Deletions...Failed with: ', { cause: error });
    }
  }

  async fetchBoard(boardId: string): Promise<BoardDTO> {
    try {
      const board = await db.board.findUnique({
        where: {
          id: boardId,
        },
        include: {
          workflows: {
            include: {
              tasks: true,
            },
          },
          edgeConstraints: true,
        },
      });

      if (!board) {
        throw new Error('Error fetching board');
      }

      const allCols: ColumnDTO[] = [];
      for (const col of board.workflows) {
        const currCol: ColumnDTO = {
          id: col.id,
          name: col.name,
          boardId: col.boardId,
          limit: col.limit,
          orderIdx: col.orderIdx,
          tasks: col.tasks.map((task) => task.id),
        };

        allCols.push(currCol);
      }

      const us = await Promise.all(board.edgeConstraints.map(async (edge) => {
        return await db.edgeConstraint.findUnique({
          where: {
            id: edge.uId,
          },
        });
      }));

      const vs = await Promise.all(board.edgeConstraints.map(async (edge) => {
        return await db.edgeConstraint.findUnique({
          where: {
            id: edge.vId,
          },
        });
      }));


      const bdto: BoardDTO = {
        id: board.id,
        projectId: board.projectId,
        name: board.name,
        workflows: allCols,
        edgeConstraints: board.edgeConstraints.map((edge) => ({
          id: edge.id,
          boardId: edge.boardId,
          uId: edge.uId,
          vId: edge.vId,
        })),
      };

      return bdto;
    } catch (error) {
      throw new Error('Board Deletions...Failed with: ', { cause: error });
    }
  }

  async fetchCol(colId: string): Promise<ColumnDTO> {
    try {
      const col = await db.workflow.findUnique({
        where: {
          id: colId,
        },
      });

      if (!col) {
        throw new Error('Error fetching board');
      }

      const coldto: ColumnDTO = {
        id: col.id,
        boardId: col.boardId,
        name: col.name,
        orderIdx: col.orderIdx,
        limit: col.limit,
      };

      return coldto;
    } catch (error) {
      throw new Error('Board Deletions...Failed with: ', { cause: error });
    }
  }
}

export const boardService = new BoardService();
