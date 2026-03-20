import type {
  Dispatch,
  SetStateAction,
  SubmitEventHandler,
} from 'react';
import type { User } from '../context/AuthContext';
import type {
  EdgeConstraint,
  Priority,
  TaskType,
  Workflow,
} from '../types/boards.types';
import type { Board } from '../types/project.types';

export interface RuntimeContext {
  projectId: string | undefined;
  activeBoard: Board;
  boards: Board[];
  activeIndex: number;
  user: User | null;
  onError: (msg: string) => void;
}

export interface TaskFormState {
  activeColumnId: string | null;
  assignee: string;
  taskName: string;
  taskDescription: string;
  dueDate: string;
  taskType: TaskType;
  priority: Priority;
  setParent: boolean;
  taskId: string;
  currentTaskId: string | null;
}

export interface EdgeFormState {
  fromEdgeName: string;
  toEdgeName: string;
}

export interface BoardState {
  workflowState: Workflow[];
  edges: EdgeConstraint[];
}

export interface BoardSetters {
  setWorkflowState: Dispatch<SetStateAction<Workflow[]>>;
  setDragHighlight: Dispatch<SetStateAction<boolean[]>>;
  setShowAddTaskModal: Dispatch<SetStateAction<boolean>>;
  setTaskName: Dispatch<SetStateAction<string>>;
  setTaskDescription: Dispatch<SetStateAction<string>>;
  setTaskType: Dispatch<SetStateAction<TaskType>>;
  setPriority: Dispatch<SetStateAction<Priority>>;
  setAssignee: Dispatch<SetStateAction<string>>;
  setDueDate: Dispatch<SetStateAction<string>>;
  setEditModal: Dispatch<SetStateAction<boolean>>;
  setCurrentTaskId: Dispatch<SetStateAction<string | null>>;
  setIsAddingEdge: Dispatch<SetStateAction<boolean>>;
  setEdges: Dispatch<SetStateAction<EdgeConstraint[]>>;
}

export interface BoardHandlers {
  handleAdd: SubmitEventHandler<HTMLFormElement>;
  handleEdit: SubmitEventHandler<HTMLFormElement>;
  handleAddEdge: SubmitEventHandler<HTMLFormElement>;
  deleteColumn: (workflowId: string) => Promise<void>;
  renameColumn: (workflowId: string, name: string) => Promise<void>;
}

export interface CreateBoardHandlersParams {
  runtime: RuntimeContext;
  taskForm: TaskFormState;
  edgeForm: EdgeFormState;
  state: BoardState;
  setters: BoardSetters;
}
