import type { Dispatch, SetStateAction } from 'react';
import type { User } from '../../context/AuthContext';
import type { BoardHandlers } from '../../utils/board.utils';
import type { Board } from '../../types/project.types';
import type {
  EdgeConstraint,
  Priority,
  Task,
  TaskType,
  Workflow,
} from '../../types/boards.types';

export interface TaskCardSetState {
  setTaskName: Dispatch<SetStateAction<string>>;
  setTaskDescription: Dispatch<SetStateAction<string>>;
  setTaskType: Dispatch<SetStateAction<TaskType>>;
  setPriority: Dispatch<SetStateAction<Priority>>;
  setAssignee: Dispatch<SetStateAction<string>>;
  setDueDate: Dispatch<SetStateAction<string>>;
  setEditModal: Dispatch<SetStateAction<boolean>>;
  setCurrentTaskId: Dispatch<SetStateAction<string | null>>;
  setTaskId: Dispatch<SetStateAction<string>>;
  setShowChild: Dispatch<SetStateAction<boolean>>;
  setShowChildOf: Dispatch<SetStateAction<Task[] | null>>;
}

export interface BoardsViewProps {
  boards: Board[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  activeBoard: Board;
  workflowState: Workflow[];
  setWorkflowState: Dispatch<SetStateAction<Workflow[]>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  boardName: string;
  setBoardName: Dispatch<SetStateAction<string>>;
  boardLimit: number;
  setBoardLimit: Dispatch<SetStateAction<number>>;
  dragHighlight: boolean[];
  setDragHighlight: Dispatch<SetStateAction<boolean[]>>;
  taskName: string;
  setTaskName: Dispatch<SetStateAction<string>>;
  taskDescription: string;
  setTaskDescription: Dispatch<SetStateAction<string>>;
  taskType: TaskType;
  setTaskType: Dispatch<SetStateAction<TaskType>>;
  priority: Priority;
  setPriority: Dispatch<SetStateAction<Priority>>;
  assignee: string;
  setAssignee: Dispatch<SetStateAction<string>>;
  dueDate: string;
  setDueDate: Dispatch<SetStateAction<string>>;
  taskId: string;
  setParent: boolean;
  setSetParent: Dispatch<SetStateAction<boolean>>;
  showChild: boolean;
  setShowChild: Dispatch<SetStateAction<boolean>>;
  showChildOf: Task[] | null;
  showViewEdgesModal: boolean;
  setShowViewEdgesModal: Dispatch<SetStateAction<boolean>>;
  edges: EdgeConstraint[];
  setEdges: Dispatch<SetStateAction<EdgeConstraint[]>>;
  boardRefreshKey: number;
  fromEdgeName: string;
  setFromEdgeName: Dispatch<SetStateAction<string>>;
  toEdgeName: string;
  setToEdgeName: Dispatch<SetStateAction<string>>;
  isAddingEdge: boolean;
  setIsAddingEdge: Dispatch<SetStateAction<boolean>>;
  showAddTaskModal: boolean;
  setShowAddTaskModal: Dispatch<SetStateAction<boolean>>;
  setActiveColumnId: Dispatch<SetStateAction<string | null>>;
  editModal: boolean;
  setEditModal: Dispatch<SetStateAction<boolean>>;
  setCurrentTaskId: Dispatch<SetStateAction<string | null>>;
  setBoardRefreshKey: Dispatch<SetStateAction<number>>;
  setState: TaskCardSetState;
  boardHandlers: BoardHandlers;
  role: string | undefined;
  projectId: string | undefined;
  user: User | null;
}

export interface BoardsModalStackProps {
  showAddTaskModal: boolean;
  setShowAddTaskModal: Dispatch<SetStateAction<boolean>>;
  showViewEdgesModal: boolean;
  setShowViewEdgesModal: Dispatch<SetStateAction<boolean>>;
  editModal: boolean;
  setEditModal: Dispatch<SetStateAction<boolean>>;
  setCurrentTaskId: Dispatch<SetStateAction<string | null>>;
  showChild: boolean;
  setShowChild: Dispatch<SetStateAction<boolean>>;
  showChildOf: Task[] | null;
  taskName: string;
  setTaskName: Dispatch<SetStateAction<string>>;
  taskDescription: string;
  setTaskDescription: Dispatch<SetStateAction<string>>;
  taskType: TaskType;
  role: string | undefined;
  setTaskType: Dispatch<SetStateAction<TaskType>>;
  priority: Priority;
  setPriority: Dispatch<SetStateAction<Priority>>;
  assignee: string;
  setAssignee: Dispatch<SetStateAction<string>>;
  dueDate: string;
  setDueDate: Dispatch<SetStateAction<string>>;
  taskId: string;
  setParent: boolean;
  setSetParent: Dispatch<SetStateAction<boolean>>;
  edges: EdgeConstraint[];
  workflowState: Workflow[];
  projectId: string | undefined;
  activeBoard: Board;
  setEdges: Dispatch<SetStateAction<EdgeConstraint[]>>;
  isAddingEdge: boolean;
  setIsAddingEdge: Dispatch<SetStateAction<boolean>>;
  fromEdgeName: string;
  setFromEdgeName: Dispatch<SetStateAction<string>>;
  toEdgeName: string;
  setToEdgeName: Dispatch<SetStateAction<string>>;
  boardHandlers: BoardHandlers;
}

export interface BoardsKanbanProps {
  boards: Board[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  activeBoard: Board;
  workflowState: Workflow[];
  setWorkflowState: Dispatch<SetStateAction<Workflow[]>>;
  dragHighlight: boolean[];
  setDragHighlight: Dispatch<SetStateAction<boolean[]>>;
  setEdges: Dispatch<SetStateAction<EdgeConstraint[]>>;
  boardRefreshKey: number;
  setBoardRefreshKey: Dispatch<SetStateAction<number>>;
  setShowAddTaskModal: Dispatch<SetStateAction<boolean>>;
  setActiveColumnId: Dispatch<SetStateAction<string | null>>;
  role: string | undefined;
  projectId: string | undefined;
  user: User | null;
  edges: EdgeConstraint[];
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  boardName: string;
  setBoardName: Dispatch<SetStateAction<string>>;
  boardLimit: number;
  setBoardLimit: Dispatch<SetStateAction<number>>;
  boardHandlers: BoardHandlers;
  setState: TaskCardSetState;
  setShowViewEdgesModal: Dispatch<SetStateAction<boolean>>;
}
