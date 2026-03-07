export enum NotifType {
  TASK_ASSIGNED = 'TASK_ASSIGNED', // Personal
  STATUS_CHANGED = 'STATUS_CHANGED', // Broadcast
  COMMENT_ADDED = 'COMMENT_ADDED', // Boardcast
  THREAD_STARTED = 'THREAD_STARTED', // Boardcast
  MENTIONED = 'MENTIONED', // Personal
  REPLY = 'REPLY', // Personal
}

export interface NotifBody {
  userId: number;
  senderId: number;
  taskId: string | null;
  commentId: string | null;
  threadId: string | null;
  type: NotifType;
}

export interface NotificationDTO extends NotifBody {
  id: string;
  timestamp: Date;
  userName: string;
}
