export type NotifType =
  | 'TASK_ASSIGNED' // Personal
  | 'STATUS_CHANGED' // Broadcast
  | 'COMMENT_ADDED' // Boardcast
  | 'THREAD_STARTED' // Boardcast
  | 'MENTIONED' // Personal
  | 'REPLY' // Personal


export interface NotifBody {
  recipientId: number;
  senderId: number;
  taskId: string | null;
  commentId: string | null;
  threadId: string | null;
  type: NotifType;
}

export interface NotificationDTO extends NotifBody {
  id: string;
  recipientName: string;
  senderName: string;
  read: boolean;
}
