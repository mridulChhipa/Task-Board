import type { Request, Response, NextFunction } from 'express';
import type { CreateTaskBody } from '../types/task.types';
import { taskService } from '../services/task.service';

export class TaskController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: CreateTaskBody = req.body;
      const taskId = await taskService.create(body);
      res.status(201).json({
        status: 'success',
        taskId,
      });

      next();
    } catch (error) {
      console.log('Task create control err: ', error);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: CreateTaskBody = req.body;
      const taskId = req.params.taskId;
      if (typeof taskId !== 'string') {
        throw new Error('Invalid type for taskId');
      }

      await taskService.update(taskId, body);

      res.status(200).json({
        status: 'success',
        msg: 'Task updated successfully',
      });

      next();
    } catch (error) {
      console.log('Task create control err: ', error);
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.taskId;
      if (typeof taskId !== 'string') {
        throw new Error('Invalid type for taskId');
      }

      await taskService.delete(taskId);

      res.status(200).json({
        status: 'success',
        msg: 'Task deleted successfully',
      });

      next();
    } catch (error) {
      console.log('Task create control err: ', error);
      next(error);
    }
  }

  async getTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const taskId = req.params.taskId;
      if (typeof taskId !== 'string') {
        throw new Error('Invalid taskId format');
      }
      const fetchedTask = await taskService.getTask(taskId);
      res.status(200).json({ data: fetchedTask });
      next();
    } catch (error) {
      console.log('Fetch error: ', error);
      next(error);
    }
  }
}

export const taskController = new TaskController();
