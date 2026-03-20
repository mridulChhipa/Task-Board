import type { User } from '../../context/AuthContext';
import type { NotificationDTO } from '../../types/Notification.types';
import type { NotifDisplay, ProjectMember } from './dashboard.types';

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

export async function fetchNotificationDisplayData(
  notifications: NotificationDTO[],
): Promise<NotifDisplay[]> {
  return Promise.all(
    notifications.map(async (notif) => {
      const taskRes = await fetch(`http://localhost:3000/api/task/${notif.taskId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const taskData = await taskRes.json();
      const taskName = taskData.task.title;

      const senderRes = await fetch(
        `http://localhost:3000/api/auth/${notif.senderId}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      const senderData = await senderRes.json();
      const senderName = senderData.data.personalData.name;

      return {
        type: notif.type,
        taskName,
        id: notif.id,
        read: notif.read,
        sender: senderName,
      } as NotifDisplay;
    }),
  );
}

export async function fetchProjectMembers(
  currProject: string,
): Promise<ProjectMember[]> {
  async function getEmail(userId: number): Promise<string> {
    const res = await fetch(`http://localhost:3000/api/auth/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const userData = await res.json();
    return userData.data.personalData.email;
  }

  const res = await fetch(`http://localhost:3000/api/project/${currProject}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  const users = data.data.members as User[];

  return Promise.all(
    users.map(async (member) => ({
      email: await getEmail(member.userId),
      role: member.role,
    })),
  );
}
