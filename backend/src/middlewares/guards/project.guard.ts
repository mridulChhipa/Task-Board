import type { Response, Request, NextFunction, RequestHandler } from 'express';
import type { ProjectRole } from '../../types/project.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';

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
      const { projectId } = authReq.params;

      if (!projectId) {
        throw new Error('Project ID is required for authorization');
      }

      if (typeof projectId !== 'string') {
        throw new Error('Invalid Project ID format');
      }

      const membership = await db.projectMember.findUnique({
        where: {
          uniqueUser: {
            projectId,
            userId,
          },
        },
      });

      if (
        !membership ||
        !allowedRoles.includes(membership.role as ProjectRole)
      ) {
        throw new Error('Access denied: Insufficient project permissions');
      }
    } catch (err) {
      next(err);
    }
  };
}
