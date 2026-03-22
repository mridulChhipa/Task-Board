import type { Prisma } from '../../generated/prisma/client';
import type { NotificationDTO, NotifType } from '../types/notifcation.types';

type NotificationWithRecipient = Prisma.NotificationGetPayload<{
  include: {
    recipient: true;
    sender: true;
  };
}>;

export function toNotifDTO(notif: NotificationWithRecipient): NotificationDTO {
  return {
    id: notif.id,
    senderId: notif.senderId,
    recipientId: notif.recipient.id,
    recipientName: notif.recipient.name,
    senderName: notif.sender.name,
    type: notif.type as NotifType,
    taskId: notif.taskId,
    commentId: notif.commentId,
    threadId: notif.threadId,
    read: notif.read,
  };
}
