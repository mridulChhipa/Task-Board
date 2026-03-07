import { EventEmitter } from 'events';

export interface NotificationEvent {
  type: 'TASK_ASSIGNED' | 'STATUS_CHANGED' | 'COMMENT_ADDED' | 'USER_MENTIONED';
  recipientIds: string[];
  notificationId: string;
  actorName: string;
  entityType: 'task' | 'project';
  entityId: string;
  message: string;
  createdAt: string;
}

class WSEventEmitter extends EventEmitter {}
export const NOTIFICATION_EVENT = 'notification';
export const wsEventEmitter = new WSEventEmitter();
