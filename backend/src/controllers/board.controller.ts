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
        console.log("Params", req.params);
        throw new Error('Invalid type for projectId');
      }

      await boardService.create(projectId, req.body.name);
      res.status(201).json({
        status: 'success',
        msg: 'Board Created Successfully',
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
      console.log(req.params);
      if (typeof boardId !== 'string') {
        throw new Error('Invalid type for boardId');
      }

      await boardService.update(boardId, req.body.name);
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

      await boardService.addColumn(boardId, req.body.name, req.body.limit);
      res.status(201).json({
        status: 'success',
        msg: 'Column added Successfully',
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
      if (typeof columnId !== 'string') {
        throw new Error('Invalid type for projectId');
      }

      await boardService.updateColumn(columnId, req.body.name, req.body.limit, req.body.orderIdx);
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
      if (typeof columnId !== 'string') {
        throw new Error('Invalid type for projectId');
      }

      await boardService.deleteColumn(columnId);
      res.status(200).json({
        status: 'success',
        msg: 'Column updated Successfully',
      });

      next();
    } catch (error) {
      next(error);
    }
  }

}

export const boardController = new BoardController();
