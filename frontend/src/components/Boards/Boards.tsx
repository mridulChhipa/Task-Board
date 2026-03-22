import { useContext, useState } from 'react';
import type { Board } from '../../types/project.types';
import type {
  EdgeConstraint,
  Task,
  TaskType,
  Priority,
} from '../../types/boards.types';
import { createBoardHandlers } from '../../utils/board.utils';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { handleError } from '../../App';
import BoardsView from './BoardsView';

interface Props {
  boards: Board[];
  role: string | undefined;
}

export default function Boards({ boards, role }: Props) {
  const { user } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBoard = boards[activeIndex];
  const [workflowState, setWorkflowState] = useState(activeBoard.workflows);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const { pid: projectId } = useParams();
  const [boardName, setBoardName] = useState<string>('');
  const [boardLimit, setBoardLimit] = useState<number>(0);

  const [dragHighlight, setDragHighlight] = useState<boolean[]>(
    activeBoard.workflows.map(() => false),
  );
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('STORY');
  const [priority, setPriority] = useState<Priority>('LOW');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [taskId, setTaskId] = useState('');
  const [setParent, setSetParent] = useState(false);
  const [showChild, setShowChild] = useState(false);
  const [showChildOf, setShowChildOf] = useState<Task[] | null>(null);
  const [showViewEdgesModal, setShowViewEdgesModal] = useState(false);
  const [edges, setEdges] = useState<EdgeConstraint[]>(activeBoard.edges ?? []);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  const [fromEdgeName, setFromEdgeName] = useState<string>('');
  const [toEdgeName, setToEdgeName] = useState<string>('');
  const [isAddingEdge, setIsAddingEdge] = useState<boolean>(false);

  const [editModal, setEditModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const setState = {
    setTaskName: setTaskName,
    setTaskDescription: setTaskDescription,
    setTaskType: setTaskType,
    setPriority: setPriority,
    setAssignee: setAssignee,
    setDueDate: setDueDate,
    setEditModal: setEditModal,
    setCurrentTaskId: setCurrentTaskId,
    setTaskId: setTaskId,
    setShowChild: setShowChild,
    setShowChildOf: setShowChildOf,
  };

  const handleSetActiveIndex = (index: number) => {
    const nextBoard = boards[index];
    setActiveIndex(index);
    setWorkflowState(nextBoard.workflows);
    setDragHighlight(nextBoard.workflows.map(() => false));
    setEdges(nextBoard.edges ?? []);
  };

  const boardHandlers = createBoardHandlers({
    runtime: {
      projectId,
      activeBoard,
      boards,
      activeIndex,
      user,
      onError: handleError,
    },
    taskForm: {
      activeColumnId,
      assignee,
      taskName,
      taskDescription,
      dueDate,
      taskType,
      priority,
      setParent,
      taskId,
      currentTaskId,
    },
    edgeForm: {
      fromEdgeName,
      toEdgeName,
    },
    state: {
      workflowState,
      edges,
    },
    setters: {
      setWorkflowState,
      setDragHighlight,
      setShowAddTaskModal,
      setTaskName,
      setTaskDescription,
      setTaskType,
      setPriority,
      setAssignee,
      setDueDate,
      setEditModal,
      setCurrentTaskId,
      setIsAddingEdge,
      setEdges,
    },
  });

  if (boards.length === 0) {
    return (
      <>
        <br />
        <h1>Start Working</h1>
      </>
    );
  }

  return (
    <BoardsView
      boards={boards}
      activeIndex={activeIndex}
      setActiveIndex={handleSetActiveIndex}
      activeBoard={activeBoard}
      workflowState={workflowState}
      setWorkflowState={setWorkflowState}
      isAdding={isAdding}
      setIsAdding={setIsAdding}
      boardName={boardName}
      setBoardName={setBoardName}
      boardLimit={boardLimit}
      setBoardLimit={setBoardLimit}
      dragHighlight={dragHighlight}
      setDragHighlight={setDragHighlight}
      taskName={taskName}
      setTaskName={setTaskName}
      taskDescription={taskDescription}
      setTaskDescription={setTaskDescription}
      taskType={taskType}
      setTaskType={setTaskType}
      priority={priority}
      setPriority={setPriority}
      assignee={assignee}
      setAssignee={setAssignee}
      dueDate={dueDate}
      setDueDate={setDueDate}
      taskId={taskId}
      setParent={setParent}
      setSetParent={setSetParent}
      showChild={showChild}
      setShowChild={setShowChild}
      showChildOf={showChildOf}
      showViewEdgesModal={showViewEdgesModal}
      setShowViewEdgesModal={setShowViewEdgesModal}
      edges={edges}
      setEdges={setEdges}
      boardRefreshKey={boardRefreshKey}
      fromEdgeName={fromEdgeName}
      setFromEdgeName={setFromEdgeName}
      toEdgeName={toEdgeName}
      setToEdgeName={setToEdgeName}
      isAddingEdge={isAddingEdge}
      setIsAddingEdge={setIsAddingEdge}
      showAddTaskModal={showAddTaskModal}
      setShowAddTaskModal={setShowAddTaskModal}
      setActiveColumnId={setActiveColumnId}
      editModal={editModal}
      setEditModal={setEditModal}
      setCurrentTaskId={setCurrentTaskId}
      setBoardRefreshKey={setBoardRefreshKey}
      setState={setState}
      boardHandlers={boardHandlers}
      role={role}
      projectId={projectId}
      user={user}
    />
  );
}
