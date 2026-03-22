import { useContext, useState } from 'react';
import styles from './project.page.module.css';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import AddBoard from '../../components/Projects/AddBoard';
import type { SubmitEvent } from 'react';
import {
  ProjectContext,
  ProjectDispatchContext,
} from '../../context/ProjectContext';
import type { Board, Project } from '../../types/project.types';
import Boards from '../../components/Boards/Boards';
import { AuthContext } from '../../context/AuthContext';

export default function ProjectPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [boardName, setBoardName] = useState('');

  const { user } = useContext(AuthContext);

  const dispatch = useContext(ProjectDispatchContext);
  const { project } = useContext(ProjectContext);
  const role = project?.members.find(
    (member) => member.userId === user?.userId,
  )?.role;

  async function handleAdd(e: SubmitEvent) {
    e.preventDefault();

    if (!project) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/project/${project.id}/board/create`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: boardName,
            projectId: project.id,
          }),
        },
      );

      const resJson = await res.json();
      console.log(resJson);

      const rawBoard = resJson.board;
      const board: Board = {
        ...rawBoard,
        workflows: (rawBoard.workflows ?? []).map(
          (workflow: Board['workflows'][number]) => ({
            ...workflow,
            tasks: workflow.tasks ?? [],
          }),
        ),
        edges: rawBoard.edgeConstraints ?? rawBoard.edges ?? [],
      };
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
  // console.log(project);
  return (
    <>
      {showAddModal && (
        <Modal onclick={() => setShowAddModal(false)}>
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
          <div className={styles.leftHeader}>
            <h1 className={styles.desc}>{project.name}</h1>
            <p className={styles.desc}>{project.description}</p>
          </div>
          {(project.role === 'PROJECT_ADMIN' ||
            user?.role === 'GLOBAL_ADMIN') && (
            <Button
              onClick={() => {
                setShowAddModal(true);
              }}
            >
              Add Board
            </Button>
          )}
        </div>
        <hr />
        <Boards boards={project.boards ?? []} role={role} />
      </div>
    </>
  );
}
