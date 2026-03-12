import type { Request, Response, NextFunction } from 'express';
import { boardService } from '../services/board.service';

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

      const bid = await boardService.create(projectId, req.body.name);
      res.status(201).json({
        status: 'success',
        bid,
      });

      next();
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

      next();
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

      next();
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
      const columnId = req.params.columnId;
      const boardId = req.params.boardId;

      // if (typeof columnId !== 'string') {
      if (typeof columnId !== 'string' || typeof boardId !== 'string') {
        throw new Error('Invalid type for projectId');
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

      next();
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
        throw new Error('Invalid type for projectId');
      }

      await boardService.deleteColumn(columnId, boardId);
      res.status(200).json({
        status: 'success',
        msg: 'Column deleted Successfully',
      });

      next();
    } catch (error) {
      next(error);
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
        throw new Error('Invalid type for boardid');
      }

      await boardService.deleteBoard(boardId);
      res.status(200).json({
        status: 'success',
        msg: 'Board deleted Successfully',
      });

      next();
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
      const boardId = req.params.boardId;
      if (typeof boardId !== 'string') {
        throw new Error('Invalid type for boardid');
      }

      const board = await boardService.fetchBoard(boardId);
      res.status(200).json({
        status: 'success',
        board,
      });

      next();
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
        throw new Error('Invalid type for boardid');
      }

      const fcol = await boardService.fetchBoard(colId);
      res.status(200).json({
        status: 'success',
        fcol,
      });

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const boardController = new BoardController();
