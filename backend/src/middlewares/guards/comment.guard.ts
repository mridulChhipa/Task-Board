import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { GlobalRole, type ProjectRole } from '../../types/project.types';

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
    throw new Error('Task not found for authorization');
  }

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  const membership = await db.projectMember.findUnique({
    where: {
      uniqueUser: {
        projectId: task.status.board.projectId,
        userId,
      },
    },
  });

  if (!user) {
    throw new Error('User does not exists');
  }

  if (!membership) {
    if (user.globalRole !== GlobalRole.GLOBAL_ADMIN) {
      throw new Error('Not a global user');
    }
  } else if (!allowedRoles.includes(membership.role as ProjectRole)) {
    throw new Error('Insufficient Priviledges');
  }
}

async function resolveTaskIdFromComment(commentId: string): Promise<string | null> {
  let currentId: string | null = commentId;
  let safety = 0;

  while (currentId && safety < 20) {
    const comment: { thread: { taskId: string } | null; parentId: string | null } | null = await db.comment.findUnique({
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

export function authorizeTaskIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const userId = authReq.user.sub;
      const email = authReq.user.email;

      const rawTaskId = authReq.params.taskId ?? authReq.body.taskId;
      const taskId =
        typeof rawTaskId === 'string' && rawTaskId.trim() !== ''
          ? rawTaskId
          : undefined;

      if (!taskId) {
        throw new Error('Task ID is required for authorization');
      }

      await authorizeForTask(taskId, userId, email, allowedRoles);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authorizeThreadIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const userId = authReq.user.sub;
      const email = authReq.user.email;

      const rawThreadId =
        authReq.params.tid ?? authReq.params.threadId ?? authReq.body.threadId;
      const threadId =
        typeof rawThreadId === 'string' && rawThreadId.trim() !== ''
          ? rawThreadId
          : undefined;

      if (!threadId) {
        throw new Error('Thread ID is required for authorization');
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
        throw new Error('Thread not found for authorization');
      }

      await authorizeForTask(thread.taskId, userId, email, allowedRoles);
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
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const userId = authReq.user.sub;
      const email = authReq.user.email;

      const rawCommentId =
        authReq.params.cid ?? authReq.params.commentId ?? authReq.body.commentId;
      const commentId =
        typeof rawCommentId === 'string' && rawCommentId.trim() !== ''
          ? rawCommentId
          : undefined;

      if (!commentId) {
        throw new Error('Comment ID is required for authorization');
      }

      let taskId = await resolveTaskIdFromComment(commentId);

      if (!taskId) {
        const rawThreadId =
          authReq.query.threadId ?? authReq.body.threadId;
        const threadId =
          typeof rawThreadId === 'string' && rawThreadId.trim() !== ''
            ? rawThreadId
            : undefined;

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
        throw new Error('Comment task not found for authorization');
      }

      await authorizeForTask(taskId, userId, email, allowedRoles);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authoriseCommentAuthor(): RequestHandler {
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

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authoriseThreadAuthor(): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const id = authReq.user.sub;

      let threadId = authReq.params.tid ?? authReq.params.threadId;
      if (threadId === undefined) {
        threadId = authReq.body.threadId;
      }

      if (!threadId) {
        throw new Error('Thread ID is required for authorization');
      }

      if (typeof threadId !== 'string') {
        throw new Error('Invalid Thread ID format');
      }

      const user = await db.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        throw new Error('User does not exist');
      }

      const thread = await db.thread.findUnique({
        where: {
          id: threadId,
        },
      });

      if (!thread) {
        throw new Error('Thread does not exist');
      }

      if (thread.authorId !== id) {
        throw new Error('User is not the author of the thread');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
