import Button from "../../components/Button/Button";
import styles from "./Dashboard.module.css";
import NavBar from "../../components/NavBar/Navbar";
import { useContext, useState } from "react";
import type {JSX} from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../user_data/UserDataContext";
import default_avatar from "../../assets/default_avatar.png";
import settings_icon from "../../assets/settings_icon.png";
import Modal from "../../components/Modal/Modal";

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

    const userData = useContext(UserContext);
    // const userDataDispatch = useContext(UserDispatchContext);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState<JSX.Element>(<></>);
    const [projects, setProjects] = useState<Project[]>([]);

    async function button_click() {
        console.log(userData.name);
        console.log(userData.email);
        console.log(userData.role);
        console.log(userData.projects);
        console.log(userData.avatar);
        console.log(userData.refreshToken);
    }

    async function logout() {
        const response = await fetch("http://localhost:3000/api/auth/logout", {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        navigate('/');
        console.log(data);
    }

    function createProject() {
        setShowModal(true);

        async function submitProject(e: React.SubmitEvent<HTMLFormElement>) {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const projectName = formData.get("projectName")?.toString() || "";
            const projectDescription = formData.get("projectDescription")?.toString() || "";
            const response = await fetch("http://localhost:3000/api/project/create", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: projectName,
                    description: projectDescription,
                }),
            });
            if(response.ok){
                console.log("Project created successfully");
                const data = await response.json();
                const project = data.data;
                console.log(project);
                setProjects([...projects, project]);
            }
            else{
                // refresh token and try again.
                await fetch("http://localhost:3000/api/auth/refresh", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        refreshToken: userData.refreshToken,
                    }),
                }).then(async (refreshData) => {
                    userData.refreshToken = (await refreshData.json()).refreshToken;
                    const retryResponse = await fetch("http://localhost:3000/api/project/create", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: projectName,
                            description: projectDescription,
                        }),
                    });
                    if(retryResponse.ok){
                        console.log("Project created successfully");
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
                <h2 style={{textAlign: "center"}}>Create a new Project</h2>
                <form className={styles.createProjectForm} onSubmit={submitProject}>
                    <div className={styles.inputArea}>
                        <label htmlFor="projectName">Project Name:</label>
                        <br />
                        <input type="text" id="projectName" name="projectName" required />
                    </div>
                    <div className={styles.inputArea}>
                        <label htmlFor="projectDescription">Project Description:</label>
                        <br />
                        <input type="text" id="projectDescription" name="projectDescription" required />
                    </div>
                    <div style={{ height: "20px" }}></div>
                    <div style={{display: "flex", gap: "1rem"}}>
                        <Button priority="first" type="submit" onClick={() => {}}>Create</Button>
                        <Button priority="second" onClick={() => setShowModal(false)}>Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }

    const left_list = [
        {item: <Button priority="second" onClick={button_click} disabled={!(userData.role === "GLOBAL_ADMIN")}>Create Project</Button>, onClick: createProject},
    ];

    const right_list = [
        {item: <Button priority="first" onClick={logout}>Logout</Button>, onClick: logout},
        {item: <img src={userData.avatar === null ? default_avatar : userData.avatar} alt="profile" style={{height: "50px"}}></img>, onClick: () => {navigate('/profile')}},
        {item: <div className={styles.usernameBlock}> 
          {<p>{userData.name}</p>}
          {<p>{userData.email}</p>}
        </div>, onClick: () => {}},
        {item: <div>
            <p>Role: {userData.role}</p>
        </div>, onClick: () => {}},
        {item: <img src={settings_icon} alt="settings" style={{height: "35px"}}></img>, onClick: () => {navigate('/settings')}},
    ]

    return (
        <>
            <NavBar left_list={left_list} right_list={right_list} />
            {showModal && <Modal onclick={() => setShowModal(false)}>{modalContent}</Modal>}
            <div className={styles.mainContainer}>
                <div className={styles.dashboard}>
                    <h1>Dashboard</h1>
                    <h2>Welcome, {userData.name}!</h2>
                    <h2>Your Projects</h2>
                    <div style={{height: "20px"}}></div>
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
                                <td><img src={settings_icon} alt="settings" style={{height: "25px"}} onClick={() => {setShowModal(true)}} /></td>
                            </tr>
                            <tr className={styles.oddRow}>
                                <td>Project 1</td>
                                <td>John Doe</td>
                                <td>2023-10-01</td>
                                <td>2023-10-05</td>
                                <td><img src={settings_icon} alt="settings" style={{height: "25px"}} onClick={() => {setShowModal(true)}} /></td>
                            </tr>
                            <tr className={styles.evenRow}>
                                <td>Project 1</td>
                                <td>John Doe</td>
                                <td>2023-10-01</td>
                                <td>2023-10-05</td>
                                <td><img src={settings_icon} alt="settings" style={{height: "25px"}} onClick={() => {setShowModal(true)}} /></td>
                            </tr>
                            <tr className={styles.oddRow}>
                                <td>Project 1</td>
                                <td>John Doe</td>
                                <td>2023-10-01</td>
                                <td>2023-10-05</td>
                                <td><img src={settings_icon} alt="settings" style={{height: "25px"}} onClick={() => {setShowModal(true)}} /></td>
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