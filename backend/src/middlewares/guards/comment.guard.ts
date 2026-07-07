import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import type { ProjectRole } from '../../types/project.types';
import { authorizeMembership, resolveId } from './membership';
import { ForbiddenError, NotFoundError, ValidationError } from '../../errors';

async function authorizeForTask(
  taskId: string,
  userId: number,
  email: string,
  allowedRoles: ProjectRole[],
): Promise<void> {
  const task = await db.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      status: {
        select: {
          board: {
            select: {
              projectId: true,
            },
          },
        },
      },
    },
  });

  if (!task?.status?.board?.projectId) {
    throw new NotFoundError('Task not found for authorization');
  }

  await authorizeMembership(
    task.status.board.projectId,
    userId,
    email,
    allowedRoles,
  );
}

async function resolveTaskIdFromComment(
  commentId: string,
): Promise<string | null> {
  let currentId: string | null = commentId;
  let safety = 0;

  while (currentId && safety < 20) {
    const comment: {
      thread: { taskId: string } | null;
      parentId: string | null;
    } | null = await db.comment.findUnique({
      where: {
        id: currentId,
      },
      select: {
        thread: {
          select: {
            taskId: true,
          },
        },
        parentId: true,
      },
    });

    if (!comment) {
      return null;
    }

    if (comment.thread?.taskId) {
      return comment.thread.taskId;
    }

    currentId = comment.parentId ?? null;
    safety += 1;
  }

  return null;
}

export function authorizeThreadIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const threadId = resolveId(req, ['tid', 'threadId']);

      if (!threadId) {
        throw new ValidationError('Thread ID is required for authorization');
      }

      const thread = await db.thread.findUnique({
        where: {
          id: threadId,
        },
        select: {
          taskId: true,
        },
      });

      if (!thread) {
        throw new NotFoundError('Thread not found for authorization');
      }

      await authorizeForTask(
        thread.taskId,
        authReq.user.sub,
        authReq.user.email,
        allowedRoles,
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authorizeCommentIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const commentId = resolveId(req, ['cid', 'commentId']);

      if (!commentId) {
        throw new ValidationError('Comment ID is required for authorization');
      }

      let taskId = await resolveTaskIdFromComment(commentId);

      if (!taskId) {
        const threadId = resolveId(req, ['threadId']);

        if (threadId) {
          const thread = await db.thread.findUnique({
            where: {
              id: threadId,
            },
            select: {
              taskId: true,
            },
          });

          taskId = thread?.taskId ?? null;
        }
      }

      if (!taskId) {
        throw new NotFoundError('Comment task not found for authorization');
      }

      await authorizeForTask(
        taskId,
        authReq.user.sub,
        authReq.user.email,
        allowedRoles,
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authoriseCommentAuthor(): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const id = authReq.user.sub;
      const commentId = resolveId(req, ['commentId', 'cid']);

      if (!commentId) {
        throw new ValidationError('Comment ID is required for authorization');
      }

      const comment = await db.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          authorId: true,
        },
      });

      if (!comment) {
        throw new NotFoundError('Comment does not exist');
      }

      if (comment.authorId !== id) {
        throw new ForbiddenError('User is not the author of the comment');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authoriseThreadAuthor(): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const id = authReq.user.sub;
      const threadId = resolveId(req, ['tid', 'threadId']);

      if (!threadId) {
        throw new ValidationError('Thread ID is required for authorization');
      }

      const thread = await db.thread.findUnique({
        where: {
          id: threadId,
        },
        select: {
          authorId: true,
        },
      });

      if (!thread) {
        throw new NotFoundError('Thread does not exist');
      }

      if (thread.authorId !== id) {
        throw new ForbiddenError('User is not the author of the thread');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
