import type { Prisma } from '../../generated/prisma/client';
import type { NotificationDTO, NotifType } from '../types/notifcation.types';

type UserNotifWithUserAndNotif = Prisma.UserNotificationGetPayload<{
  include: {
    user: true;
    notification: true;
  };
}>;

export function toNotifDTO(notif: UserNotifWithUserAndNotif): NotificationDTO {
  return {
    id: notif.notificationId,
    timestamp: notif.timestamp,
    senderId: notif.notification.senderId,
    userId: notif.userId,
    userName: notif.user.name,
    type: notif.notification.type as NotifType,
    taskId: notif.notification.taskId,
    commentId: notif.notification.commentId,
    threadId: notif.notification.threadId,
  };
}
