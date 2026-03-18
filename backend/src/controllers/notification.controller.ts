import { notificationService } from '../services/notification.service';
import type { Request, Response, NextFunction } from 'express';
import type { NotifBody } from '../types/notifcation.types';

export class NotificationController {
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const body: NotifBody = req.body;
      const nid = await notificationService.createNotification(body);
      res.status(201).json({
        status: 'success',
        nid,
      });

      next();
    } catch (error) {
      next(error);
    }
  }

  async fetchNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const nid = req.params.nid;
      if (typeof nid !== 'string') {
        throw new Error("Can't validate the nid");
      }

      const notifcation = await notificationService.fetchNotification(nid);
      res.status(201).json({
        status: 'success',
        notifcation,
      });

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
