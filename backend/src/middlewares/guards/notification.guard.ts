import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { GlobalRole } from '../../types/project.types';
import { resolveId } from './membership';
import { ForbiddenError, NotFoundError, ValidationError } from '../../errors';

export function authorizeNotificationOwner(): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const userId = authReq.user.sub;
      const email = authReq.user.email;

      const notificationId = resolveId(req, ['nid', 'notificationId']);

      if (!notificationId) {
        throw new ValidationError(
          'Notification ID is required for authorization',
        );
      }

      const notification = await db.notification.findUnique({
        where: {
          id: notificationId,
        },
        select: {
          recipientId: true,
        },
      });

      if (!notification) {
        throw new NotFoundError('Notification not found for authorization');
      }

      if (notification.recipientId !== userId) {
        const user = await db.user.findUnique({
          where: {
            email,
          },
          select: {
            globalRole: true,
          },
        });

        if (!user || user.globalRole !== GlobalRole.GLOBAL_ADMIN) {
          throw new ForbiddenError('Not allowed to access this notification');
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
