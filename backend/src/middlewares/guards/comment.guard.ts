import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';

export function authoriseCommentAuthor() {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const id = authReq.user.sub;

      let commentId = authReq.params.commentId;
      if (commentId === undefined) {
        console.log('Undefined id');
        commentId = authReq.body.commentId;
      }

      if (!commentId) {
        throw new Error('Comment ID is required for authorization');
      }

      if (typeof commentId !== 'string') {
        throw new Error('Invalid Comment ID format');
      }

      const user = await db.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        throw new Error('User does not exist');
      }
      const comment = await db.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        throw new Error('Comment does not exist');
      }

      if (comment.authorId !== id) {
        throw new Error('User is not the author of the comment');
      }
    } catch (err) {
      next(err);
    }
  };
}
