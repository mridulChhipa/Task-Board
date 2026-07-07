import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { GlobalRole } from '../../../generated/prisma/enums';
import { ForbiddenError, UnauthorizedError } from '../../errors';

export function authorizeGlobalAdmin(): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const email = authReq.user.email;

      const user = await db.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.globalRole !== GlobalRole.GLOBAL_ADMIN) {
        throw new ForbiddenError('Global Admin priviledges required');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
