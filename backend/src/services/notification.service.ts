import { db } from '../config/db';
import type { NotifBody, NotificationDTO } from '../types/notifcation.types';
import { toNotifDTO } from '../utils/notification.utils';

export class NotificationService {
  async createNotification({
    recipientId,
    senderId,
    taskId,
    commentId,
    threadId,
    type,
  }: NotifBody): Promise<NotificationDTO> {
    try {
      const notif = await db.notification.create({
        data: {
          senderId,
          taskId,
          commentId,
          threadId,
          type,
          recipientId,
        },
        include: {
          recipient: true,
        },
      });

      return toNotifDTO(notif);
    } catch (error) {
      throw new Error("Can't create notification: ", { cause: error });
    }
  }

  async fetchNotification(notificationId: string): Promise<NotificationDTO> {
    try {
      const notif = await db.notification.findUnique({
        where: {
          id: notificationId,
        },
        include: {
          recipient: true,
          // sender: true,
        },
      });

      if (!notif) {
        throw new Error("Can't find notification");
      }

      const ndto: NotificationDTO = toNotifDTO(notif);
      return ndto;
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await db.notification.delete({
        where: {
          id: notificationId,
        },
      });
    } catch (error) {
      throw new Error("Can't delete notification: ", { cause: error });
    }
  }

  async readNotification(notificationId: string, read: boolean): Promise<void> {
    try {
      await db.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          read: read,
        },
      });
    } catch (error) {
      throw new Error("Can't read notification: ", { cause: error });
    }
  }
}

export const notificationService = new NotificationService();
