import Button from '../../components/Button/Button';
import { DummyAvatar } from '../../components/Boards/boards.images';
import type { User } from '../../context/AuthContext';
import styles from './Dashboard.module.css';
import type { NotifDisplay } from './dashboard.types';
import { typeToString } from './dashboard.utils';

type DashboardSidebarProps = {
  user: User | null;
  notifs: NotifDisplay[];
  onOpenNotifications: () => void;
  onOpenGlobalAdmins: () => void;
};

function DashboardSidebar({
  user,
  notifs,
  onOpenNotifications,
  onOpenGlobalAdmins,
}: DashboardSidebarProps) {
  return (
    <div className={styles.sidebar}>
      {user?.role === 'GLOBAL_ADMIN' && (
        <div className={styles.admin}>
          <Button onClick={onOpenGlobalAdmins}>Manage Global Admins</Button>
        </div>
      )}
      <div className={styles.upper}>
        {user?.avatar ? (
          <img src={user.avatar} className={styles.avatar} />
        ) : (
          <div className={styles.avatar}>
            <DummyAvatar />
          </div>
        )}
      </div>
      <div className={styles.notifications} style={{ textAlign: 'center' }}>
        <h2>Your Notifications</h2>
        <ul>
          {notifs.length === 0 && <li>No notifications</li>}
          {notifs
            .filter((n) => !n.read)
            .map((notification, index) => {
              if (index < 5) {
                return <li key={notification.id}>{typeToString(notification)}</li>;
              }
              return null;
            })}
        </ul>
        <Button onClick={onOpenNotifications}>View All</Button>
      </div>
    </div>
  );
}

export default DashboardSidebar;
