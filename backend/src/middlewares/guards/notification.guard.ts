import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';
import { GlobalRole } from '../../types/project.types';

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

      const rawNotificationId = authReq.params.nid ?? authReq.body.notificationId;
      const notificationId =
        typeof rawNotificationId === 'string' && rawNotificationId.trim() !== ''
          ? rawNotificationId
          : undefined;

      if (!notificationId) {
        throw new Error('Notification ID is required for authorization');
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
        throw new Error('Notification not found for authorization');
      }

      if (notification.recipientId !== userId) {
        const user = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || user.globalRole !== GlobalRole.GLOBAL_ADMIN) {
          throw new Error('Not allowed to access this notification');
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
