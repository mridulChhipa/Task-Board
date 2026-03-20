import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import {
  AuthContext,
  DispatchContext,
  type User,
} from '../../context/AuthContext';
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
import type { NotificationDTO, NotifType } from '../../types/Notification.types';
import Form, { FormControl, InputArea, Label } from '../../components/Forms/Form';
import { handleError } from '../../App';
  
function typeToString(notif: NotifDisplay): string {
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

type NotifDisplay = {
  type: NotifType;
  taskName: string;
  id: string;
  read: boolean;
  sender: string;
}

async function setNotifications(notifications: NotificationDTO[], setNotifs: React.Dispatch<React.SetStateAction<NotifDisplay[]>>) {
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

export type Operation = 'View' | 'Add' | 'Edit' | 'Remove';
export interface ProjectMember {
  email: string;
  role: string;
}

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
      fetchUser();
    }
  }, [fetchUser]);

  useEffect(() => {
    if (user?.notifications) {
      void setNotifications(user.notifications, setNotifs);
    }
  }, [user?.notifications]);

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();

    try {
      await fetch('http://localhost:3000/api/project/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
        }),
      })
        .then((res) => res.json())
        .then((resJson) => {
          // console.log(resJson);
          const project: Project = resJson.data;
          // console.log(project);

          const newProj: Project = {
            name: project.name,
            description: project.description,
            role: 'PROJECT_ADMIN',
            members: [],
            id: project.id,
            isArchived: false,
            boards: [],
          };

          if (user) {
            const updatedUser = {
              ...user,
              projects: [...user.projects, newProj],
            };

            console.log(updatedUser);

            dispatch({
              type: 'PROJECT_CREATED',
              payload: {
                user: updatedUser,
                isLoading: false,
              },
            });
          }
        })
        .catch((err) => {
          handleError('Could not create project');
          throw new Error('Error creating project', { cause: err });
        })
        .finally(() => {
          setShowCreateModal(false);
          setName('');
          setDescription('');
        });
    } catch (err) {
      throw new Error('Can createz: ', { cause: err });
    } finally {
      setShowCreateModal(false);
    }
  }

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:3000/api/project/update/${currProject}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: updatedName,
            description: updatedDesc,
            isArchived: updatedIsArchived,
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to update project: ${res.status} ${res.statusText} - ${text}`,
        );
      }

      const resJson = await res.json();
      const project: Project = resJson.data;

      const updatedProj: Project = {
        id: project.id,
        name: project.name,
        description: project.description,
        role: project.role ?? 'PROJECT_ADMIN',
        members: project.members ?? [],
        isArchived: project.isArchived,
        boards: [],
      };

      if (user) {
        // replace the updated project in user's projects (don't append a duplicate)
        const updatedUser = {
          ...user,
          projects: user.projects.map((p) =>
            p.id === updatedProj.id ? updatedProj : p,
          ),
        };

        console.log(updatedUser);

        dispatch({
          type: 'PROJECT_UPDATED',
          payload: {
            user: updatedUser,
            isLoading: false,
          },
        });
      }

      return project;
    } catch (err) {
      handleError('Could not update project');
      console.error('Error updating project:', err);
      throw err instanceof Error
        ? err
        : new Error('Error updating project', { cause: err });
    } finally {
      setShowUpdateModal(false);
      setName('');
      setDescription('');
    }
  }

  async function handleAdd(e: SubmitEvent) {
    // this function should handle both updating user role and adding users and removing users
    e.preventDefault();
    if (operation === 'Add') {
      try {
        console.log(
          'Adding user to project with email: ',
          userToAdd,
          ' and role: ',
          newRole,
        );
        const res = await fetch(
          `http://localhost:3000/api/project/assign-user/${currProject}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMail: userToAdd,
              role: newRole,
            }),
          },
        );

        if (!res.ok) {
          const test = await res.text();
          throw new Error(
            `Failed to assign user: ${res.status} ${res.statusText} - ${test}`,
          );
        }
      } catch (err) {
        throw new Error('Error adding user to project', { cause: err });
      } finally {
        setAddUser(false);
        setUserToAdd('');
        setNewRole('PROJECT_VIEWER');
        setOperation('Add');
      }
    } else if (operation === 'Edit') {
      try {
        const res = await fetch(
          `http://localhost:3000/api/project/update-role/${currProject}`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMail: userToAdd,
              role: newRole,
            }),
          },
        );
        if (!res.ok) {
          const test = await res.text();
          throw new Error(
            `Failed to edit user role: ${res.status} ${res.statusText} - ${test}`,
          );
        }
      } catch (err) {
        throw new Error('Error editing user role', { cause: err });
      } finally {
        setAddUser(false);
        setUserToAdd('');
        setNewRole('PROJECT_VIEWER');
        setOperation('Add');
      }
    } else {
      try {
        const res = await fetch(
          `http://localhost:3000/api/project/remove-user/${currProject}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMail: userToAdd,
            }),
          },
        );

        if (!res.ok) {
          const test = await res.text();
          throw new Error(
            `Failed to remove user: ${res.status} ${res.statusText} - ${test}`,
          );
        }
      } catch (err) {
        throw new Error('Error removing user from project', { cause: err });
      } finally {
        setAddUser(false);
        setUserToAdd('');
        setNewRole('PROJECT_VIEWER');
        setOperation('Add');
      }
    }
  }

  async function addGlobal(e: SubmitEvent) {
    e.preventDefault();
    try {
      await fetch(`http://localhost:3000/api/auth/update-user`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: globalAdminEmail,
          globalRole: 'GLOBAL_ADMIN',
        }),
      });
    }
    catch (err) {
      handleError('Error adding global admin');
      throw new Error('Error adding global admin', { cause: err });
    }
  }

  async function getMembers(): Promise<ProjectMember[]> {
    async function getEmail(userId: number): Promise<string> {
      try {
        const res = await fetch(`http://localhost:3000/api/auth/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });
        const userData = await res.json();
        console.log(userData);
        return userData.data.personalData.email;
      } catch (err) {
        handleError('Could not find email of user');
        throw new Error('Error finding email of user', { cause: err });
      }
    }
    try {
      const res = await fetch(
        `http://localhost:3000/api/project/${currProject}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await res.json();
      const users = data.data.members;
      const projectMembers: ProjectMember[] = users.map((user: User) => {
        return {
          email: getEmail(user.userId),
          role: user.role,
        };
      });
      console.log(projectMembers);
      return projectMembers;
    } catch (err) {
      handleError('Error fetching project members');
      throw new Error('Error fetching project members', { cause: err });
    }
  }
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
            handleCreate={handleCreate}
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
            handleUpdate={handleUpdate}
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
            handleAdd={handleAdd}
            setAddUser={setAddUser}
            projectMembers={projectMembers}
          />
        </Modal>
      )}

      {showNotifications && (
        <Modal onclick={async () => {
          setShowNotifications(false);
        }}>
            <h2>Your Notifications</h2>
            {(user?.notifications === undefined || user?.notifications.length === 0) && <p>No notifications</p>}
            {notifs.map((notification) => {
              return (
                <div className={styles.notification}>
                  <div className={styles.notifText}>{typeToString(notification)}</div>
                  <div className={styles.notifSender}>From: {notification.sender}</div>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
                    <span onClick={async () => {
                      console.log('current status: ', notification.read);
                      setNotifs((prev) => prev.map((n) => n.id === notification.id ? {...n, read: !notification.read} : n));
                      await fetch(`http://localhost:3000/api/notification/${notification.id}`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ read: notification.read }),
                      });
                      console.log("status changed to: ", !notification.read);
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {notification.read ? <IconEnvelopeClosed size={15} /> : <IconEnvelopeOpen size={15} />}
                    </span>
                    <span onClick={async () => {
                      setNotifs(notifs.filter((n) => n.id !== notification.id));
                      await fetch(`http://localhost:3000/api/notification/${notification.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                      });
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
          <Form onSubmit={addGlobal}>
            <InputArea>
            <Label htmlFor='email'>User Email</Label>
              <FormControl
                type='email'
                placeholder='e.g. admin@example.com'
                name='email'
                required
                value={globalAdminEmail}
                onChange={(e) => setGlobalAdminEmail(e.target.value)}
              />
            </InputArea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
            <Button onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          </div>
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
                        setAddUser(true);
                        setCurrProject(project.id);
                        void getMembers()
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
                        setCurrProject(project.id);
                        setUpdatedDesc(project.description);
                        setUpdatedName(project.name);
                        setUpdatedIsArchived(project.isArchived);
                        setShowUpdateModal(true);
                      }}
                      aria-label={`Settings for ${project.name}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconSettings size={25} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className={styles.notifications} style={{ textAlign: 'center'}}>
            <h2>Your Notifications</h2>
            <ul>
              {(notifs === undefined || notifs.length === 0) && <li>No notifications</li>}
              {notifs?.filter((n) => !n.read).map((notification, index) => {
                if(index < 5)return <li key={index}>{typeToString(notification)}</li>;
              })}
            </ul>
            <Button onClick={async () => {
              setShowNotifications(true);
            }}>
              View All
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashBoard;
