import styles from './Dashboard.module.css';
import DashboardModals from './DashboardModals';
import DashboardProjectsTable from './DashboardProjectsTable';
import DashboardSidebar from './DashboardSidebar';
import useDashboardController from './useDashboardController';

function DashBoard() {
  const {
    user,
    projects,
    notifs,
    setShowCreateModal,
    setShowNotifications,
    setShowAdminModal,
    openManageMembers,
    openProjectSettings,
    modalProps,
  } = useDashboardController();

  return (
    <>
      <DashboardModals {...modalProps} />
      <div className={styles.mainContainer}>
        <DashboardProjectsTable
          projects={projects}
          onCreateProject={() => setShowCreateModal(true)}
          onManageMembers={(project) => void openManageMembers(project.id)}
          onOpenProjectSettings={openProjectSettings}
        />
        <DashboardSidebar
          user={user ?? null}
          notifs={notifs}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenGlobalAdmins={() => setShowAdminModal(true)}
        />
      </div>
    </>
  );
}

export default DashBoard;
