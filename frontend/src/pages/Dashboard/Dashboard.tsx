import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import { AuthContext, DispatchContext } from '../../context/AuthContext';
import { useFetchUser } from '../../utils/auth.utils';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/project.types';

import Button from '../../components/Button/Button';
import styles from './Dashboard.module.css';
import Modal from '../../components/Modal/Modal';
import CreateProject from '../../components/Projects/CreateProject';
import UpdateProject from '../../components/Projects/UpdateProject';
import AddUser from '../../components/Projects/AddUser';
import {
  DummyAvatar,
  IconDelete,
  IconEnvelopeOpen,
  IconEnvelopeClosed,
  IconSettings,
} from '../../components/Boards/boards.images';
import Form, {
  FormControl,
  InputArea,
  Label,
} from '../../components/Form/Form';
import { handleError } from '../../App';
import {
  setNotifications,
  typeToString,
  type NotifDisplay,
} from '../../utils/notifications.utils';
import { handleCreate, handleUpdate } from '../../utils/project.handlers';
import {
  handleAdd,
  addGlobal,
  getMembers,
  type ProjectMember,
} from '../../utils/users.handler';

export type Operation = 'View' | 'Add' | 'Edit' | 'Remove';

function DashBoard() {
  const { user } = useContext(AuthContext);
  const dispatch = useContext(DispatchContext);
  const [currProject, setCurrProject] = useState('');
  const [updatedName, setUpdatedName] = useState('');
  const [updatedDesc, setUpdatedDesc] = useState('');
  const [updatedIsArchived, setUpdatedIsArchived] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [operation, setOperation] = useState<Operation>('Add');
  const [addUser, setAddUser] = useState(false);
  const [userToAdd, setUserToAdd] = useState('');
  const [newRole, setNewRole] = useState('PROJECT_VIEWER');
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState<NotifDisplay[]>([]);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [globalAdminEmail, setGlobalAdminEmail] = useState('');

  const fetchUser = useFetchUser();
  const projects = (user?.projects as Project[]) ?? [];
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      console.log('fetching user');
      fetchUser();
    }
  }, [fetchUser, userId]);

  useEffect(() => {
    if (user?.notifications) {
      void setNotifications(user.notifications, setNotifs);
    }
  }, [user?.notifications]);
  return (
    <>
      {showCreateModal && (
        <Modal onclick={() => setShowCreateModal(false)}>
          <CreateProject
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            setShowCreateModal={setShowCreateModal}
            handleCreate={(e: SubmitEvent) =>
              handleCreate(e, {
                name,
                setName,
                description,
                setDescription,
                setShowCreateModal,
                currProject,
                updatedName,
                setUpdatedName,
                updatedDesc,
                setUpdatedDesc,
                updatedIsArchived,
                setUpdatedIsArchived,
                setShowUpdateModal,
                user,
                dispatch,
                handleError,
              })
            }
          />
        </Modal>
      )}

      {showUpdateModal && (
        <Modal onclick={() => setShowUpdateModal(false)}>
          <UpdateProject
            updatedName={updatedName}
            setUpdatedName={setUpdatedName}
            updatedDesc={updatedDesc}
            setUpdatedDesc={setUpdatedDesc}
            updatedArc={updatedIsArchived}
            setUpdatedArc={setUpdatedIsArchived}
            setShowUpdateModal={setShowUpdateModal}
            handleUpdate={(e: SubmitEvent) =>
              handleUpdate(e, {
                name,
                setName,
                description,
                setDescription,
                setShowCreateModal,
                currProject,
                updatedName,
                setUpdatedName,
                updatedDesc,
                setUpdatedDesc,
                updatedIsArchived,
                setUpdatedIsArchived,
                setShowUpdateModal,
                user,
                dispatch,
                handleError,
              })
            }
          />
        </Modal>
      )}

      {addUser && (
        <Modal onclick={() => setAddUser(false)}>
          <AddUser
            operation={operation}
            setOperation={setOperation}
            userToAdd={userToAdd}
            setUserToAdd={setUserToAdd}
            newRole={newRole}
            setNewRole={setNewRole}
            handleAdd={(e: SubmitEvent) =>
              handleAdd(e, {
                operation,
                setOperation,
                userToAdd,
                setUserToAdd,
                newRole,
                setNewRole,
                setAddUser,
                currProject,
                globalAdminEmail,
                handleError,
              })
            }
            setAddUser={setAddUser}
            projectMembers={projectMembers}
            canManageUsers={
              user?.role === 'GLOBAL_ADMIN' ||
              projects.find((p) => p.id === currProject)?.role ===
                'PROJECT_ADMIN'
            }
          />
        </Modal>
      )}

      {showNotifications && (
        <Modal
          onclick={async () => {
            setShowNotifications(false);
          }}
        >
          <h2>Your Notifications</h2>
          {(user?.notifications === undefined ||
            user?.notifications.length === 0) && <p>No notifications</p>}
          {notifs.map((notification) => {
            return (
              <div
                className={styles.notification}
                key={notification.id}
                style={{
                  backgroundColor: notification.read ? '#f0f0f0' : '#e0e7ff',
                }}
              >
                <div className={styles.notifText}>
                  {typeToString(notification)}
                </div>
                <div className={styles.notifSender}>
                  From: {notification.sender}
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}
                >
                  <span
                    onClick={async () => {
                      console.log('current status: ', notification.read);
                      setNotifs((prev) =>
                        prev.map((n) =>
                          n.id === notification.id
                            ? { ...n, read: !notification.read }
                            : n,
                        ),
                      );
                      await fetch(
                        `http://localhost:3000/api/notification/${notification.id}`,
                        {
                          method: 'PATCH',
                          credentials: 'include',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ read: !notification.read }),
                        },
                      );
                      console.log('status changed to: ', !notification.read);
                    }}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {notification.read ? (
                      <IconEnvelopeClosed size={15} />
                    ) : (
                      <IconEnvelopeOpen size={15} />
                    )}
                  </span>
                  <span
                    onClick={async () => {
                      setNotifs(notifs.filter((n) => n.id !== notification.id));
                      await fetch(
                        `http://localhost:3000/api/notification/${notification.id}`,
                        {
                          method: 'DELETE',
                          credentials: 'include',
                        },
                      );
                    }}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconDelete size={15} />
                  </span>
                </div>
              </div>
            );
          })}
        </Modal>
      )}

      {showAdminModal && (
        <Modal onclick={() => setShowAdminModal(false)}>
          <h2>Add Global Administrators</h2>
          <Form
            onSubmit={(e: SubmitEvent) =>
              addGlobal(e, {
                operation: 'Add',
                setOperation: setOperation,
                userToAdd: '',
                setUserToAdd: setUserToAdd,
                newRole: '',
                setNewRole: setNewRole,
                setAddUser: setAddUser,
                currProject: '',
                globalAdminEmail,
                handleError,
              })
            }
          >
            <InputArea>
              <Label htmlFor="email">User Email</Label>
              <FormControl
                type="email"
                placeholder="e.g. admin@example.com"
                name="email"
                required
                value={globalAdminEmail}
                onChange={(e) => setGlobalAdminEmail(e.target.value)}
              />
            </InputArea>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <Button
                priority="second"
                type="button"
                onClick={() => setShowAdminModal(false)}
              >
                Cancel
              </Button>
              <Button priority="first" type="submit">
                Add Global Admin
              </Button>
            </div>
          </Form>
        </Modal>
      )}

      <div className={styles.mainContainer}>
        <div className={styles.dashboard}>
          <div className={styles.projectHeader}>
            <h2>Projects</h2>
            <Button
              onClick={() => setShowCreateModal(true)}
              disabled={user?.role !== 'GLOBAL_ADMIN'}
            >
              Create Project
            </Button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.projectTable}>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Role</th>
                  <th>Description</th>
                  {/* <th>Last Modified</th> */}
                  <th>Members</th>
                  <th>More Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr
                    key={project.id}
                    style={{ cursor: 'pointer' }}
                    className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  >
                    <td>
                      <Link
                        className={styles.projectLink}
                        to={`/project/${project.id}`}
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td>{project.role}</td>
                    <td>{project.description}</td>
                    {/* <td>{make_date(project.lastModified)}</td> */}
                    <td style={{ position: 'relative' }}>
                      <Button
                        onClick={() => {
                          const canManageUsers =
                            user?.role === 'GLOBAL_ADMIN' ||
                            project.role === 'PROJECT_ADMIN';
                          setAddUser(true);
                          setCurrProject(project.id);
                          if (!canManageUsers) {
                            setOperation('View');
                          }
                          void getMembers({
                            operation,
                            setOperation,
                            userToAdd,
                            setUserToAdd,
                            newRole,
                            setNewRole,
                            setAddUser,
                            currProject: project.id,
                            globalAdminEmail,
                            handleError,
                          })
                            .then((members) => setProjectMembers(members))
                            .catch(() => setProjectMembers([]));
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                    <td
                      style={{
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        height: '100%',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            project.role !== 'PROJECT_ADMIN' &&
                            user?.role !== 'GLOBAL_ADMIN'
                          ) {
                            handleError(
                              "You don't have permission to edit this project",
                            );
                            console.log('error raised');
                            return;
                          }
                          setCurrProject(project.id);
                          setUpdatedDesc(project.description);
                          setUpdatedName(project.name);
                          setUpdatedIsArchived(project.isArchived);
                          setShowUpdateModal(true);
                        }}
                        aria-label={`Settings for ${project.name}`}
                        className={styles.settingsButton}
                      >
                        <IconSettings size={25} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.sidebar}>
          {user?.role === 'GLOBAL_ADMIN' && (
            <div className={styles.admin}>
              <Button onClick={() => setShowAdminModal(true)}>
                Manage Global Admins
              </Button>
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
          <div className={styles.notifSidebar} style={{ textAlign: 'center' }}>
            <h2>Your Notifications</h2>
            <ul
              style={{
                marginLeft: '0px',
                paddingLeft: '0px',
                listStyleType: 'none',
              }}
            >
              {(notifs === undefined || notifs.length === 0) && (
                <li>No notifications</li>
              )}
              {notifs
                ?.filter((n) => !n.read)
                .map((notification, index) => {
                  if (index < 5) {
                    return (
                      <li key={index} className={styles.notifPreview}>
                        {typeToString(notification)}
                      </li>
                    );
                  }
                })}
            </ul>
            <Button
              onClick={async () => {
                setShowNotifications(true);
              }}
            >
              View All
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashBoard;
