import type { Dispatch, SetStateAction } from 'react';
import Modal from '../../components/Modal/Modal';
import {
  IconDelete,
  IconEnvelopeClosed,
  IconEnvelopeOpen,
} from '../../components/Boards/boards.images';
import styles from './Dashboard.module.css';
import type { NotifDisplay } from './dashboard.types';
import { typeToString } from './dashboard.utils';

type DashboardNotificationsModalProps = {
  showNotifications: boolean;
  setShowNotifications: Dispatch<SetStateAction<boolean>>;
  notifs: NotifDisplay[];
  setNotifs: Dispatch<SetStateAction<NotifDisplay[]>>;
};

function DashboardNotificationsModal({
  showNotifications,
  setShowNotifications,
  notifs,
  setNotifs,
}: DashboardNotificationsModalProps) {
  if (!showNotifications) {
    return null;
  }

  return (
    <Modal onclick={async () => setShowNotifications(false)}>
      <h2>Your Notifications</h2>
      {notifs.length === 0 && <p>No notifications</p>}
      {notifs.map((notification) => (
        <div className={styles.notification} key={notification.id}>
          <div className={styles.notifText}>{typeToString(notification)}</div>
          <div className={styles.notifSender}>From: {notification.sender}</div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
            <span
              onClick={async () => {
                setNotifs((prev) =>
                  prev.map((n) =>
                    n.id === notification.id ? { ...n, read: !notification.read } : n,
                  ),
                );
                await fetch(`http://localhost:3000/api/notification/${notification.id}`, {
                  method: 'PATCH',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ read: notification.read }),
                });
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {notification.read ? <IconEnvelopeClosed size={15} /> : <IconEnvelopeOpen size={15} />}
            </span>
            <span
              onClick={async () => {
                setNotifs((prev) => prev.filter((n) => n.id !== notification.id));
                await fetch(`http://localhost:3000/api/notification/${notification.id}`, {
                  method: 'DELETE',
                  credentials: 'include',
                });
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <IconDelete size={15} />
            </span>
          </div>
        </div>
      ))}
    </Modal>
  );
}

export default DashboardNotificationsModal;
