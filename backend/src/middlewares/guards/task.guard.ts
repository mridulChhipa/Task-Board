import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { GlobalRole, type ProjectRole } from '../../types/project.types';

async function authorizeForProject(
  projectId: string,
  userId: number,
  email: string,
  allowedRoles: ProjectRole[],
): Promise<void> {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  const membership = await db.projectMember.findUnique({
    where: {
      uniqueUser: {
        projectId,
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
        throw new Error('Task not found for authorization');
      }

      await authorizeForProject(projectId, userId, email, allowedRoles);
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
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const userId = authReq.user.sub;
      const email = authReq.user.email;

      const rawStatusId = authReq.body.statusId;
      const statusId =
        typeof rawStatusId === 'string' && rawStatusId.trim() !== ''
          ? rawStatusId
          : undefined;

      if (!statusId) {
        throw new Error('Status ID is required for authorization');
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
        throw new Error('Workflow not found for authorization');
      }

      await authorizeForProject(projectId, userId, email, allowedRoles);
      next();
    } catch (err) {
      next(err);
    }
  };
}
