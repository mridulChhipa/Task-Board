import { db } from '../config/db';
import type { NotifBody, NotificationDTO } from '../types/notifcation.types';
import { toNotifDTO } from '../utils/notification.utils';
import { sendNotif } from '../websocket/WebsocketsService';

export class NotificationService {
  async createNotification({
    userId,
    senderId,
    taskId,
    commentId,
    type,
  }: NotifBody): Promise<string> {
    try {
      const notif = await db.notification.create({
        data: {
          senderId,
          taskId,
          commentId,
          type,
        },
      });

      const linkage = await db.userNotification.create({
        data: {
          userId,
          notificationId: notif.id,
        },
      });

      sendNotif(senderId, [userId], notif.type);

      return linkage.id;
    } catch (error) {
      throw new Error("Can't create notification: ", { cause: error });
    }
  }

  async fetchNotification(userNotifId: string): Promise<NotificationDTO> {
    try {
      const notif = await db.userNotification.findUnique({
        where: {
          id: userNotifId,
        },
        include: {
          notification: true,
          user: true,
        },
      });

      if (!notif) {
        throw new Error("Can't find notification");
      }

      const ndto: NotificationDTO = toNotifDTO(notif);
      return ndto;
    } catch (error) {
      throw new Error("Can't create notification: ", { cause: error });
    }
  }
}

export const notificationService = new NotificationService();
