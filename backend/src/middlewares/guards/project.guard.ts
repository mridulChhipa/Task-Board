import type { Response, Request, NextFunction, RequestHandler } from 'express';
import type { ProjectRole } from '../../types/project.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { GlobalRole } from '../../../generated/prisma/enums';

export function authorizeProjectRole(
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

      let projectId = authReq.params.projectId;
      if (projectId === undefined) {
        console.log('Undefined id');
        projectId = authReq.body.projectId;
      }

      if (!projectId) {
        throw new Error('Project ID is required for authorization');
      }

      if (typeof projectId !== 'string') {
        throw new Error('Invalid Project ID format');
      }

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
      } else {
        if (!allowedRoles.includes(membership.role as ProjectRole)) {
          throw new Error('Insufficient Priviledges');
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
