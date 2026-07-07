import type { Response, Request, NextFunction, RequestHandler } from 'express';
import type { ProjectRole } from '../../types/project.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { authorizeMembership, resolveId } from './membership';
import { ValidationError } from '../../errors';

export function authorizeProjectRole(
  allowedRoles: ProjectRole[],
): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const projectId = resolveId(req, ['projectId']);

      if (!projectId) {
        throw new ValidationError('Project ID is required for authorization');
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
