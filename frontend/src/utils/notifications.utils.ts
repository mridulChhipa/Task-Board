import type { NotificationDTO, NotifType } from "../types/Notification.types";

export function typeToString(notif: NotifDisplay): string {
  switch (notif.type) {
    case 'TASK_ASSIGNED':
      return 'Task ' + notif.taskName + ' is assigned to you';
    case 'STATUS_CHANGED':
      return 'Status changed of task ' + notif.taskName;
    case 'COMMENT_ADDED':
      return 'A comment was added to task ' + notif.taskName;
    case 'THREAD_STARTED':
      return 'A thread was started on task ' + notif.taskName;
    case 'MENTIONED':
      return 'You were mentioned in a comment in task ' + notif.taskName;
    case 'REPLY':
      return 'Someone replied to your comment in task ' + notif.taskName;
    default:
      return 'You have a new notification';
  }
}

export type NotifDisplay = {
  type: NotifType;
  taskName: string;
  id: string;
  read: boolean;
  sender: string;
}

export async function setNotifications(notifications: NotificationDTO[], setNotifs: React.Dispatch<React.SetStateAction<NotifDisplay[]>>) {
  setNotifs(await Promise.all(
    notifications.map(async (notif) => {
      const res = await fetch(`http://localhost:3000/api/task/${notif.taskId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      const taskName = data.task.title;
      const res2 = await fetch(`http://localhost:3000/api/auth/${notif.senderId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data2 = await res2.json();
      const senderName = data2.data.personalData.name;
      return {
        type: notif.type,
        taskName,
        id: notif.id,
        read: notif.read,
        sender: senderName,
      } as NotifDisplay;
    })
  ));
}
