import { commentService } from '../services/comment.service';
import type { Request, Response, NextFunction } from 'express';
import type {
  CommentBody,
  CommentDTO,
  ThreadBody,
  UpdateCommentBody,
  UpdateThreadBody,
} from '../types/comment.types';

export class CommentController {
  async createThread(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // console.log("===========\n ReqBody from thread : ", );
      const threadyBody: ThreadBody = req.body;
      console.log(threadyBody);
      const thread = await commentService.createThread(threadyBody);

      res.status(201).json({
        status: 'success',
        thread,
      });
    } catch (error) {
      // throw new Error('Error creating thread from controller: ', {
      //   cause: error,
      // });

      next(error);
    }
  }

  async updateThread(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const threadBody: UpdateThreadBody = req.body;
      const tid = req.params.tid;
      if (typeof tid !== 'string') {
        throw new Error('Invalid tid');
      }

      await commentService.updateThread(tid, threadBody);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      // throw new Error('Error updating thread from controller: ', {
      //   cause: error,
      // });

      next(error);
    }
  }

  async deleteThread(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const tid = req.params.tid;
      if (typeof tid !== 'string') {
        throw new Error('Invalid tid');
      }

      await commentService.deleteThread(tid);

      res.status(204).json({
        status: 'success',
      });
    } catch (error) {
      // throw new Error('Error updating thread from controller: ', {
      //   cause: error,
      // });

      next(error);
    }
  }

  async createComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const commentBody: CommentBody = req.body;
      const comment: CommentDTO = await commentService.createComment(commentBody);

      res.status(201).json({
        status: 'success',
        comment,
      });
    } catch (error) {
      // throw new Error('Error creating comment from controller: ', {
      //   cause: error,
      // });

      next(error);
    }
  }

  async updateComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
      // throw new Error('Error updating comment from controller: ', {
      //   cause: error,
      // });
      next(error);
    }
  }

  async deleteComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const cid = req.params.cid;
      if (typeof cid !== 'string') {
        throw new Error('Invalid tid');
      }

      await commentService.deleteComment(cid, req.body.threadId);

      res.status(204).json({
        status: 'success',
      });
    } catch (error) {
      // throw new Error('Error updating thread from controller: ', {
      //   cause: error,
      // });
      next(error);
    }
  }

  async fetchComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const cid = req.params.cid;
      if (typeof cid !== 'string') {
        throw new Error('cid type error');
      }

      const data = commentService.fetchComment(cid);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async fetchThread(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const tid = req.params.tid;
      if (typeof tid !== 'string') {
        throw new Error('tid type error');
      }

      const data = commentService.fetchComment(tid);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const commentController = new CommentController();
