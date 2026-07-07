import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import type { ProjectRole } from '../../types/project.types';
import { authorizeMembership, resolveId } from './membership';
import { NotFoundError, ValidationError } from '../../errors';

export function authorizeTaskIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const taskId = resolveId(req, ['taskId']);

      if (!taskId) {
        throw new ValidationError('Task ID is required for authorization');
      }

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

      const projectId = task?.status?.board?.projectId;
      if (!projectId) {
        throw new NotFoundError('Task not found for authorization');
      }

      await authorizeMembership(
        projectId,
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

export function authorizeStatusIdRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const rawStatusId = req.body.statusId;
      const statusId =
        typeof rawStatusId === 'string' && rawStatusId.trim() !== ''
          ? rawStatusId
          : undefined;

      if (!statusId) {
        throw new ValidationError('Status ID is required for authorization');
      }

      const workflow = await db.workflow.findUnique({
        where: {
          id: statusId,
        },
        select: {
          board: {
            select: {
              projectId: true,
            },
          },
        },
      });

      const projectId = workflow?.board?.projectId;
      if (!projectId) {
        throw new NotFoundError('Workflow not found for authorization');
      }

      await authorizeMembership(
        projectId,
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
