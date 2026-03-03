import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { GlobalRole } from '../../../generated/prisma/enums';

export function authorizeGlobalAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const userId = authReq.user.sub;

      const user = await db.user.findUnique({
        where: {
          id: userId,
        }
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!(user.globalRole === GlobalRole.GLOBAL_ADMIN)) {
        throw new Error('Global Admin priviledges required');
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
