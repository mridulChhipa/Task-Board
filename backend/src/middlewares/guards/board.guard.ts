import type { Response, Request, NextFunction, RequestHandler } from 'express';
import type { ProjectRole } from '../../types/project.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { authorizeMembership, resolveId } from './membership';
import { NotFoundError, ValidationError } from '../../errors';

async function authorizeForBoard(
  boardId: string,
  userId: number,
  email: string,
  allowedRoles: ProjectRole[],
): Promise<void> {
  const board = await db.board.findUnique({
    where: {
      id: boardId,
    },
    select: {
      projectId: true,
    },
  });

  if (!board) {
    throw new NotFoundError('Board not found for authorization');
  }

  await authorizeMembership(board.projectId, userId, email, allowedRoles);
}

export function authorizeBoardIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const boardId = resolveId(req, ['boardId']);

      if (!boardId) {
        throw new ValidationError('Board ID is required for authorization');
      }

      await authorizeForBoard(
        boardId,
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

export function authorizeColumnIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const columnId = resolveId(req, ['colId', 'columnId']);

      if (!columnId) {
        throw new ValidationError('Column ID is required for authorization');
      }

      const workflow = await db.workflow.findUnique({
        where: {
          id: columnId,
        },
        select: {
          boardId: true,
        },
      });

      if (!workflow) {
        throw new NotFoundError('Workflow not found for authorization');
      }

      await authorizeForBoard(
        workflow.boardId,
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
