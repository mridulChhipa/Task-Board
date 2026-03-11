// import { useParams } from 'react-router-dom';
import { useContext, useState } from 'react';
import styles from './project.page.module.css';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import AddBoard from '../components/Projects/AddBoard';
import { fetchBoard } from '../utils/board.utils';
import type { SubmitEvent } from 'react';
import {
  ProjectContext,
  ProjectDispatchContext,
} from '../context/ProjectContext';
import type { Board, Project } from '../types/project.types';
import Boards from '../components/Boards/Boards';

export default function ProjectPage() {
  // const { pid } = useParams();
  // const [project, setProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [boardName, setBoardName] = useState('');

  // async function loadProject() {
  //   const data = await fetchProject(pid as string);
  //   setProject(data);
  // }

  // useEffect(() => {
  //   loadProject();
  // }, [pid]);

  // if (!project) {
  //   return <div>Loading...</div>;
  // }

  const dispatch = useContext(ProjectDispatchContext);
  const { project } = useContext(ProjectContext);

  async function handleAdd(e: SubmitEvent) {
    e.preventDefault();

    if (!project) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/project/${project?.id}/board/create`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: boardName,
            projectId: project?.id,
          }),
        },
      );

      const resJson = await res.json();
      console.log(resJson);
      const { bid } = resJson;

      const board = await fetchBoard(bid, project.id);
      console.log(board);
      const updatedBoards: Board[] = project.boards;
      updatedBoards.push(board);
      const updatedProj: Project = {
        ...project,
        boards: updatedBoards,
      };

      dispatch({
        type: 'APPEND_BOARD',
        payload: {
          project: updatedProj,
          isLoading: false,
        },
      });

      setShowAddModal(false);
      setBoardName('');
    } catch (err) {
      console.error('Cannot create board:', err);
    }
  }

  if (!project) {
    return <div>Loading</div>;
  }

  return (
    <>
      {showAddModal && (
        <Modal>
          <AddBoard
            name={boardName}
            setName={setBoardName}
            setShowAddModal={setShowAddModal}
            handleAdd={handleAdd}
          />
        </Modal>
      )}
      <div className={styles.container}>
        <div className={styles.projectHeader}>
          <h1>{project.name}</h1>
          <span className={styles.desc}>{project.description}</span>
          <Button onClick={() => setShowAddModal(true)}>Add Board</Button>
        </div>
        <hr />
        <Boards boards={project.boards ?? []} />
      </div>
    </>
  );
}
