import type { Request, Response, NextFunction } from 'express';
import { boardService } from '../services/board.service';
import type { BoardDTO } from '../types/board.types';

export class BoardController {
  async createBoard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const projectId = req.params.projectId;
      if (typeof projectId !== 'string') {
        console.log('Params', req.params);
        throw new Error('Invalid type for projectId');
      }

      const board: BoardDTO = await boardService.create(
        projectId,
        req.body.name,
      );
      res.status(201).json({
        status: 'success',
        board,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateBoard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const boardId = req.params.boardId;
      // const projectId = req.params.projectId;
      if (typeof boardId !== 'string' /*|| typeof projectId !== 'string'*/) {
        throw new Error('Invalid type for boardId');
      }

      await boardService.update(boardId, req.body.name);
      // await boardService.update(boardId, projectId, req.body.name);
      res.status(200).json({
        status: 'success',
        msg: 'Board updated Successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addColumn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const boardId = req.params.boardId;
      if (typeof boardId !== 'string') {
        throw new Error('Invalid type for boardId');
      }

      const column = await boardService.addColumn(
        boardId,
        req.body.name,
        req.body.limit,
        req.body.orderIdx,
      );

      res.status(201).json({
        status: 'success',
        column,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateColumn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log(
        'Updating column with id: ',
        req.params.columnId,
        ' in board: ',
        req.params.boardId,
      );
      const columnId = req.params.columnId;
      const boardId = req.params.boardId;

      // if (typeof columnId !== 'string') {
      if (typeof columnId !== 'string' || typeof boardId !== 'string') {
        throw new Error('Invalid type for columnId or boardId');
      }

      await boardService.updateColumn(
        columnId,
        boardId,
        req.body.name,
        req.body.limit,
        req.body.orderIdx,
      );
      res.status(200).json({
        status: 'success',
        msg: 'Column updated Successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteColumn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const columnId = req.params.columnId;
      const boardId = req.params.boardId;

      // if (typeof columnId !== 'string') {
      if (typeof columnId !== 'string' || typeof boardId !== 'string') {
        throw new Error('Invalid type for columnId or boardId');
      }

      await boardService.deleteColumn(columnId, boardId);
      res.status(200).json({
        status: 'success',
        msg: 'Column deleted Successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addEdge(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const boardId = req.params.boardId;

      if (typeof boardId !== 'string') {
        throw new Error('Invalid type for boardId');
      }

      const edge = await boardService.addEdge(
        boardId,
        req.body.sourceColId,
        req.body.targetColId,
      );

      res.status(200).json({
        status: 'success',
        msg: 'Edge added Successfully',
        edge,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEdge(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const boardId = req.params.boardId;
      const edgeId = req.params.edgeId;

      if (typeof boardId !== 'string' || typeof edgeId !== 'string') {
        throw new Error('Invalid type for boardId or edgeId');
      }

      await boardService.deleteEdge(boardId, edgeId);

      res.status(200).json({
        status: 'success',
        msg: 'Edge deleted Successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteBoard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const boardId = req.params.boardId;
      if (typeof boardId !== 'string') {
        throw new Error('Invalid type for boardId');
      }

      await boardService.deleteBoard(boardId);
      res.status(200).json({
        status: 'success',
        msg: 'Board deleted Successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async fetchBoard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log('Fetching board with id: ', req.params.boardId);
      const boardId = req.params.boardId;
      if (typeof boardId !== 'string') {
        throw new Error('Invalid type for boardId');
      }

      const board = await boardService.fetchBoard(boardId);
      res.status(200).json({
        status: 'success',
        board,
      });
    } catch (error) {
      next(error);
    }
  }

  async fetchCol(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const colId = req.params.colId;
      if (typeof colId !== 'string') {
        throw new Error('Invalid type for colId');
      }

      const fcol = await boardService.fetchCol(colId);
      res.status(200).json({
        status: 'success',
        fcol,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const boardController = new BoardController();
