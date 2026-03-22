import { notificationService } from '../services/notification.service';
import type { Request, Response, NextFunction } from 'express';
import type { NotifBody } from '../types/notifcation.types';

export class NotificationController {
  async createNotification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: NotifBody = req.body;
      const notification = await notificationService.createNotification(body);
      res.status(201).json({
        status: 'success',
        notification,
      });

      next();
    } catch (error) {
      next(error);
    }
  }

  async fetchNotification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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

  async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const nid = req.params.nid;
      if (typeof nid !== 'string') {
        throw new Error("Can't validate the nid");
      }

      await notificationService.deleteNotification(nid);
      res.status(204).json({
        status: 'success',
        data: null,
      });

      next();
    } catch (error) {
      next(error);
    }
  }

  async readNotification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const nid = req.params.nid;
      if (typeof nid !== 'string') {
        throw new Error("Can't validate the nid");
      }

      const read = req.body.read;
      if (typeof read !== 'boolean') {
        throw new Error("Can't validate the read status");
      }

      await notificationService.readNotification(nid, read);
      res.status(200).json({
        status: 'success',
        data: null,
      });

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
