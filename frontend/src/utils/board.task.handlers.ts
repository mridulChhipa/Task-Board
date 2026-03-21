import type { SubmitEventHandler } from 'react';
import type {
  Priority,
  ProjectMember,
  Workflow,
} from '../types/boards.types';
import { sortWorkflows } from './board.utils';
import type {
  RuntimeContext,
  TaskFormState,
  BoardState,
  BoardSetters,
} from './board.handlers.types';

async function getUserIdFromEmail(
  email: string,
  onError: (msg: string) => void,
): Promise<number> {
  try {
    const res = await fetch(
      `http://localhost:3000/api/auth/get-user-by-mail/${email}`,
      {
        credentials: 'include',
      },
    );
    const resJson = await res.json();
    return resJson.data.personalData.userId;
  } catch (err) {
    onError('User does not exist');
    throw new Error('Error fetching user id from email', { cause: err });
  }
}

export function createTaskHandlers(
  runtime: RuntimeContext,
  taskForm: TaskFormState,
  state: BoardState,
  setters: BoardSetters,
) {
  const { projectId, activeBoard, boards, activeIndex, user, onError } = runtime;
  const {
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
  } = taskForm;
  const { workflowState } = state;

  const {
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
  } = setters;

  const resetTaskForm = () => {
    setTaskName('');
    setTaskDescription('');
    setTaskType('STORY');
    setPriority('LOW');
    setAssignee('');
    setDueDate('');
  };

  const handleAdd: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!projectId || !activeBoard || !activeColumnId) {
      return;
    }

    const assigneeId: number = await getUserIdFromEmail(assignee, onError);
    const reporterId: number = user?.userId ?? -1;
    const dateObject = dueDate !== '' ? new Date(dueDate) : null;

    try {
      const res1 = await fetch(`http://localhost:3000/api/project/${projectId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const projectData = await res1.json();
      const members = projectData.data.members.map(
        (member: ProjectMember) => member.userId,
      );

      if (!members.includes(assigneeId)) {
        onError('Assignee is not a member of the project, failed to add task');
        throw new Error('Assignee is not a member of the project');
      }

      const res = await fetch('http://localhost:3000/api/task/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskName,
          description: taskDescription,
          type: taskType,
          priority,
          assignee: assigneeId,
          reporter: reporterId,
          dueDate: dateObject,
          statusId: activeColumnId,
          parentId: setParent ? taskId : null,
        }),
      });

      const data = await res.json();
      const newTaskId = data.taskId;
      const updatedWorkflowState: Workflow[] = workflowState.map((workflow) =>
        workflow.id === activeColumnId
          ? {
              ...workflow,
              tasks: [...workflow.tasks, newTaskId],
            }
          : workflow,
      );

      const sortedWF = await sortWorkflows(updatedWorkflowState, onError);
      setWorkflowState(sortedWF);
      setDragHighlight(sortedWF.map(() => false));
      boards[activeIndex].workflows = sortedWF;
    } catch (err) {
      console.error('Error creating task:', { cause: err });
      onError('Failed to create task');
    } finally {
      setShowAddTaskModal(false);
      resetTaskForm();
    }
  };

  const handleEdit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!currentTaskId) {
      return;
    }

    try {
      const ogRes = await fetch(`http://localhost:3000/api/task/${currentTaskId}`, {
        credentials: 'include',
      });
      const ogData = await ogRes.json();
      const parentId = ogData.task.parentId;
      const statusId = ogData.task.statusId;

      const assigneeId: number = await getUserIdFromEmail(assignee, onError);

      if (projectId) {
        const projectRes = await fetch(`http://localhost:3000/api/project/${projectId}`, {
          method: 'GET',
          credentials: 'include',
        });
        const projectData = await projectRes.json();
        const members = projectData.data.members.map(
          (member: ProjectMember) => member.userId,
        );

        if (!members.includes(assigneeId)) {
          onError('Assignee is not a member of the project, failed to edit task');
          throw new Error('Assignee is not a member of the project');
        }
      }

      await fetch(`http://localhost:3000/api/task/update/${currentTaskId}`, {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskName,
          description: taskDescription,
          type: taskType,
          priority: priority as Priority,
          reporter: user?.userId,
          assignee: assigneeId,
          parentId: setParent ? taskId : parentId,
          statusId,
          dueDate: dueDate !== '' ? new Date(dueDate) : null,
        }),
      });

      const sortedWF = await sortWorkflows([...workflowState], onError);
      setWorkflowState(sortedWF);
      setDragHighlight(sortedWF.map(() => false));
      boards[activeIndex].workflows = sortedWF;
    } catch (err) {
      console.error('Error editing task:', { cause: err });
      onError('Failed to edit task');
    } finally {
      setEditModal(false);
      resetTaskForm();
      setCurrentTaskId(null);
    }
  };

  return {
    handleAdd,
    handleEdit,
  };
}
