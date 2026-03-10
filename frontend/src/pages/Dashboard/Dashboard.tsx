import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import { AuthContext, DispatchContext } from '../../context/AuthContext';
import { useFetchUser } from '../../utils/auth.utils';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/project.types';

import Button from '../../components/Button/Button';
import styles from './Dashboard.module.css';
import dummyAvater from '../../assets/dummyAvatar.svg';
import settingsIcon from '../../assets/settingsIcon.svg';
import Modal from '../../components/Modal/Modal';
import CreateProject from '../../components/Projects/CreateProject';
import UpdateProject from '../../components/Projects/UpdateProject';
import AddUser from '../../components/Projects/AddUser';

function DashBoard() {
  const { user } = useContext(AuthContext);
  const dispatch = useContext(DispatchContext);
  const [currProject, setCurrProject] = useState('');
  const [updatedName, setUpdatedName] = useState('');
  const [updatedDesc, setUpdatedDesc] = useState('');
  const [updatedIsArchived, setUpdatedIsArchived] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [userToAdd, setUserToAdd] = useState(0);
  const [newRole, setNewRole] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchUser = useFetchUser();
  const projects = (user?.projects as Project[]) ?? [];
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
    void user;
    // console.log("From dashboard", userId);
    // if (user) {
    //   setProjects(user.projects as Project[]);
    // }
    // using useState in a useEffect causes performance issues due to re-renders
  }, [userId, user, fetchUser]);

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
  return (
    <>
      {showCreateModal && (
        <Modal>
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
        <Modal>
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
        <Modal>
          <AddUser
            userToAdd={userToAdd}
            setUserToAdd={setUserToAdd}
            newRole={newRole}
            setNewRole={setNewRole}
            handleAdd={handleAdd}
            setAddUser={setAddUser}
          />
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
                    <span style={{ position: 'absolute' }}>
                      <Button
                        onClick={() => {
                          setAddUser(true);
                        }}
                      >
                        +
                      </Button>
                    </span>
                    <ul className={styles.userList}>
                      {project.members.map((member, memIdx) => (
                        <li className={styles.userListItem} key={memIdx}>
                          {member}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={settingsIcon}
                      alt="settings"
                      style={{ height: '25px' }}
                      onClick={() => {
                        setCurrProject(project.id);
                        setUpdatedDesc(project.description);
                        setUpdatedName(project.name);
                        setShowUpdateModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.sidebar}>
          <div className={styles.upper}>
            {user?.avatar ? (
              <img src={user.avatar} className={styles.avatar} />
            ) : (
              <img src={dummyAvater} className={styles.avatar} />
            )}
          </div>
          <div className={styles.notifications}>
            <h2>Your Notifications</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashBoard;
