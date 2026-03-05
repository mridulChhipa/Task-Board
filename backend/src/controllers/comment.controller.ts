import type { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';
import type { CommentBody, ThreadBody, UpdateCommentBody, UpdateThreadBody } from '../types/comment.types';

export class CommentController {
  async createThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const threadyBody: ThreadBody = req.body;
      await commentService.createThread(threadyBody);

      res.status(201).json({
        status: 'success',
      });
    } catch (error) {
      throw new Error("Error creating thread from controller: ", { cause: error });
    }
  }

  async updateThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const threadyBody: UpdateThreadBody = req.body;
      const tid = req.params.tid;
      if (typeof tid !== 'string') {
        throw new Error('Invalid tid');
      }

      await commentService.updateThread(tid, threadyBody);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      throw new Error("Error updating thread from controller: ", { cause: error });
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentBody: CommentBody = req.body;
      await commentService.createComment(commentBody);

      res.status(201).json({
        status: 'success',
      });
    } catch (error) {
      throw new Error("Error creating comment from controller: ", { cause: error });
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentBody: UpdateCommentBody = req.body;
      const cid = req.params.cid;
      if (typeof cid !== 'string') {
        throw new Error('Invalid cid');
      }

      await commentService.updateComment(cid, commentBody);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      throw new Error("Error updating comment from controller: ", { cause: error });
    }
  }
}

export const commentController = new CommentController();
