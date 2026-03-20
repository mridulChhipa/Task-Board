import type { NotifType } from '../../types/Notification.types';

export type NotifDisplay = {
  type: NotifType;
  taskName: string;
  id: string;
  read: boolean;
  sender: string;
};

export type Operation = 'View' | 'Add' | 'Edit' | 'Remove';

export interface ProjectMember {
  email: string;
  role: string;
}
