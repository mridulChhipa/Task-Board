import Button from '../../components/Button/Button';
import styles from './Dashboard.module.css';
import { useContext, useState } from 'react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import default_avatar from '../../assets/default_avatar.png';
import settings_icon from '../../assets/settings_icon.png';
import Modal from '../../components/Modal/Modal';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  manager_name: string;
  manager_id: number;
  isArchived: boolean;
}

// function make_date(date: string): string {
//     const today = new Date();
//     const dateObj = new Date(date);
//     if(today.getFullYear() === dateObj.getFullYear() && today.getMonth() === dateObj.getMonth() && today.getDate() === dateObj.getDate()){
//         return dateObj.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
//     }
//     else if(today.getFullYear() === dateObj.getFullYear() && today.getMonth() === dateObj.getMonth()) return dateObj.getDate().toString();
//     else if(today.getFullYear() === dateObj.getFullYear()) return dateObj.getMonth().toString();
//     else return dateObj.getFullYear().toString();
// }

function DashBoard() {
  const authData = useContext(AuthContext);
  // const userDataDispatch = useContext(DispatchContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<JSX.Element>(<></>);
  const [projects, setProjects] = useState<Project[]>([]);

  // async function button_click() {
  //     console.log(authData.user.name);
  //     console.log(authData.user.email);
  //     console.log(authData.user.role);
  //     console.log(authData.user.projects);
  //     console.log(authData.user.avatar);
  //     console.log(authData.user.refreshToken);
  // }

  async function logout() {
    const response = await fetch('http://localhost:3000/api/auth/logout', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    navigate('/');
    console.log(data);
  }

  async function project_settings(project_id: string) {
    setShowModal(true);
    console.log('Project ID: ', project_id);
    setModalContent(
      <div>
        <h2 style={{ textAlign: 'center' }}>Project Settings</h2>
        <form className={styles.form}>
          <div className={styles.inputArea}>
            <label htmlFor="manager">Assign Project Manager</label>
            <input list="user_list" name="manager" />
            <datalist id="user_list">
              {/*
                                users.map((user) => (
                                    <option value={user.id}>{user.name}</option>
                                ))
                            */}
              <option value="John Doe ID:0">John Doe</option>
              <option value="Jane Smith ID:1">Jane Smith</option>
              <option value="Alice Johnson ID:2">Alice Johnson</option>
            </datalist>
          </div>
          <div className={styles.boxForm}>
            <input
              type="checkbox"
              name="archive"
              value="Archive"
              style={{ width: '30px', marginTop: '8px' }}
            />
            <label htmlFor="archive">Archive Project</label>
          </div>
          <div className={styles.inputArea}>
            <label htmlFor="projectName">Update Project Name:</label>
            <input type="text" id="projectName" name="projectName" required />
          </div>
          <div className={styles.inputArea}>
            <label htmlFor="projectDescription">Project Description:</label>
            <input
              type="text"
              id="projectDescription"
              name="projectDescription"
              required
            />
          </div>
          <div className={styles.inputArea}>
            <label htmlFor="manager">Assign Project Manager</label>
            <input list="user_list" name="manager" />
            <datalist id="user_list">
              {/*
                                users.map((user) => (
                                    <option value={user.id}>{user.name}</option>
                                ))
                            */}
              <option value="John Doe ID:0">John Doe</option>
              <option value="Jane Smith ID:1">Jane Smith</option>
              <option value="Alice Johnson ID:2">Alice Johnson</option>
            </datalist>
          </div>
        </form>
      </div>,
    );
  }

  function createProject() {
    setShowModal(true);

    async function submitProject(e: React.SubmitEvent<HTMLFormElement>) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const projectName = formData.get('projectName')?.toString() || '';
      const projectDescription =
        formData.get('projectDescription')?.toString() || '';
      const response = await fetch('http://localhost:3000/api/project/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      });
      if (response.ok) {
        console.log('Project created successfully');
        const data = await response.json();
        const project = data.data;
        console.log(project);
        setProjects([...projects, project]);
      } else {
        // refresh token and try again.
        await fetch('http://localhost:3000/api/auth/refresh', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // refreshToken: authData.user.refreshToken,
          }),
        }).then(async (refreshData) => {
          // authData.user.refreshToken = (await refreshData.json()).refreshToken;
          const retryResponse = await fetch(
            'http://localhost:3000/api/project/create',
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: projectName,
                description: projectDescription,
              }),
            },
          );
          if (retryResponse.ok) {
            console.log('Project created successfully');
            const data = await response.json();
            const project = data.data;
            console.log(project);
            setProjects([...projects, project]);
          }
        });
      }
      setShowModal(false);
    }

    setModalContent(
      <div>
        <h2 style={{ textAlign: 'center' }}>Create a new Project</h2>
        <form className={styles.form} onSubmit={submitProject}>
          <div className={styles.inputArea}>
            <label htmlFor="projectName">Project Name:</label>
            <input type="text" id="projectName" name="projectName" required />
          </div>
          <div className={styles.inputArea}>
            <label htmlFor="projectDescription">Project Description:</label>
            <input
              type="text"
              id="projectDescription"
              name="projectDescription"
              required
            />
          </div>
          <div style={{ height: '20px' }}></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button priority="first" type="submit" onClick={() => {}}>
              Create
            </Button>
            <Button priority="second" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>,
    );
  }

  // const left_list = [
  //     { item: <Button priority="second" onClick={createProject} disabled={!(authData.user.role === "GLOBAL_ADMIN")}>Create Project</Button>, onClick: createProject },
  // ];

  // const right_list = [
  //     { item: <Button priority="first" onClick={logout}>Logout</Button>, onClick: logout },
  //     { item: <img src={authData.user.avatar === null ? default_avatar : authData.user.avatar} alt="profile" style={{ height: "50px" }}></img>, onClick: () => { navigate('/profile') } },
  //     {
  //         item: <div className={styles.usernameBlock}>
  //             {<p>{authData.user?.name}</p>}
  //             {<p>{authData.user?.email}</p>}
  //         </div>, onClick: () => { }
  //     },
  //     {
  //         item: <div>
  //             <p>Role: {authData.user.role}</p>
  //         </div>, onClick: () => { }
  //     },
  //     { item: <img src={settings_icon} alt="settings" style={{ height: "35px" }}></img>, onClick: () => { navigate('/settings') } },
  // ]

  return (
    <>
      {showModal && (
        <Modal onclick={() => setShowModal(false)}>{modalContent}</Modal>
      )}
      <div className={styles.mainContainer}>
        <div className={styles.dashboard}>
          <h1>Dashboard</h1>
          <h2>Welcome, {authData.user?.email}!</h2>
          <h2>Your Projects</h2>
          <div style={{ height: '20px' }}></div>
          <table className={styles.projectTable}>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Project Manager</th>
                <th>Created</th>
                <th>Last Modified</th>
                <th>More Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* {projects.map((project, index) => (
                                <tr key={project.id} style={{cursor: "pointer"} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}}>
                                    <td onClick={() => navigate(`/project/${project.id}`)}>{project.name}</td>
                                    <td>{project.manager_name}</td>
                                    <td>{make_date(project.createdAt)}</td>
                                    <td>{make_date(project.lastModified)}</td>
                                    <td><img src={settings_icon} alt="settings" style={{height: "25px"}} onClick={() => {setShowModal(true)}} /></td>
                                </tr>
                            ))}*/}
              <tr className={styles.evenRow}>
                <td>Project 1</td>
                <td>John Doe</td>
                <td>2023-10-01</td>
                <td>2023-10-05</td>
                <td>
                  <img
                    src={settings_icon}
                    alt="settings"
                    style={{ height: '25px' }}
                    onClick={() => {
                      project_settings('');
                    }}
                  />
                </td>
              </tr>
              <tr className={styles.oddRow}>
                <td>Project 1</td>
                <td>John Doe</td>
                <td>2023-10-01</td>
                <td>2023-10-05</td>
                <td>
                  <img
                    src={settings_icon}
                    alt="settings"
                    style={{ height: '25px' }}
                    onClick={() => {
                      setShowModal(true);
                    }}
                  />
                </td>
              </tr>
              <tr className={styles.evenRow}>
                <td>Project 1</td>
                <td>John Doe</td>
                <td>2023-10-01</td>
                <td>2023-10-05</td>
                <td>
                  <img
                    src={settings_icon}
                    alt="settings"
                    style={{ height: '25px' }}
                    onClick={() => {
                      setShowModal(true);
                    }}
                  />
                </td>
              </tr>
              <tr className={styles.oddRow}>
                <td>Project 1</td>
                <td>John Doe</td>
                <td>2023-10-01</td>
                <td>2023-10-05</td>
                <td>
                  <img
                    src={settings_icon}
                    alt="settings"
                    style={{ height: '25px' }}
                    onClick={() => {
                      setShowModal(true);
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.sidebar}>
          <div className={styles.notifications}>
            <h2>Your Notifications</h2>
          </div>
          <div className={styles.updates}>
            <h2>Recent Updates</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashBoard;
