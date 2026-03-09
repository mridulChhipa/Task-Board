import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useFetchUser } from '../../utils/auth.utils';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/project.types';

import Button from '../../components/Button/Button';
import styles from './Dashboard.module.css';
import dummyAvater from '../../assets/dummyAvatar.svg';
import settingsIcon from '../../assets/settingsIcon.svg';
import Modal from '../../components/Modal/Modal';
import CreateProject from '../../components/Projects/CreateProject';

function DashBoard() {
  const { user } = useContext(AuthContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchUser = useFetchUser();
  const projects = (user?.projects as Project[]) ?? [];
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
    // console.log("From dashboard", userId);
    // if (user) {
    //   setProjects(user.projects as Project[]);
    // }
    // using useState in a useEffect causes performance issues due to re-renders
  }, [userId, fetchUser]);

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
          console.log(resJson);
          // const project = resJson.data;
          // fetchUser();
          // setProjects([...projects, project]);
        })
        .catch((err) => {
          throw new Error('Error creating project', { cause: err });
        })
        .finally(() => setShowCreateModal(false));
    } catch (err) {
      throw new Error("Can createz: ", { cause: err });
    } finally {
      setShowCreateModal(false);
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

      <div className={styles.mainContainer}>
        <div className={styles.dashboard}>
          <div className={styles.projectHeader}>
            <h2>Projects</h2>
            <Button onClick={() => setShowCreateModal(true)}>Create Project</Button>
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
                    // onClick={() => setShowModal(true)}
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
