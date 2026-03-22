import type { SubmitEventHandler } from 'react';
import type {
  Priority,
  ProjectMember,
  Task,
  Workflow,
} from '../types/boards.types';
import { sortWorkflows } from './board.utils';
import { syncStoriesWithChildrenOrder } from './dragDrop.utils';
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
  const { projectId, activeBoard, boards, activeIndex, user, onError } =
    runtime;
  const {
    activeColumnId,
    assignee,
    taskName,
    taskDescription,
    dueDate,
    isResolved,
    isClosed,
    taskType,
    priority,
    setParent,
    taskId,
    currentTaskId,
  } = taskForm;
  const { workflowState, taskCache } = state;

  const {
    setWorkflowState,
    setDragHighlight,
    setTaskCache,
    setShowAddTaskModal,
    setTaskName,
    setTaskDescription,
    setTaskType,
    setPriority,
    setAssignee,
    setDueDate,
    setIsResolved,
    setIsClosed,
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
    setIsResolved(false);
    setIsClosed(false);
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
      if (taskType === 'STORY' && setParent) {
        onError('Story cannot have a parent story');
        return;
      }

      if (isClosed && !isResolved) {
        onError('Closed tasks must be resolved first');
        return;
      }

      if (setParent) {
        const parentTask = taskCache[taskId];
        const workflowIds = new Set(workflowState.map((wf) => wf.id));
        if (!parentTask) {
          onError('Parent task is not available in the board cache');
          return;
        }
        if (parentTask.type !== 'STORY') {
          onError('Parent task must be a story');
          return;
        }
        if (!workflowIds.has(parentTask.statusId)) {
          onError('Parent task must be on the same board');
          return;
        }
      }

      const res1 = await fetch(
        `http://localhost:3000/api/project/${projectId}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
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
          parentId: taskType === 'STORY' ? null : setParent ? taskId : null,
          resolvedAt: isResolved ? new Date() : null,
          closedAt: isClosed ? new Date() : null,
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
      const now = new Date();
      const nextCache: Record<string, Task> = {
        ...taskCache,
        [newTaskId]: {
          id: newTaskId,
          title: taskName,
          description: taskDescription,
          type: taskType,
          priority,
          assignee: assigneeId,
          reporter: reporterId,
          dueDate: dateObject ?? undefined,
          statusId: activeColumnId,
          createdAt: now,
          updatedAt: now,
          resolvedAt: isResolved ? now : null,
          closedAt: isClosed ? now : null,
          parentId: setParent ? taskId : undefined,
          threads: [],
          activities: [],
          children: [],
        },
      };

      if (setParent && taskType !== 'STORY' && taskId && nextCache[taskId]) {
        const parent = nextCache[taskId];
        nextCache[taskId] = {
          ...parent,
          children: parent.children.includes(newTaskId)
            ? parent.children
            : [...parent.children, newTaskId],
        };
      }

      const syncedWF = syncStoriesWithChildrenOrder(sortedWF, nextCache);
      setTaskCache(nextCache);
      setWorkflowState(syncedWF);
      setDragHighlight(syncedWF.map(() => false));
      boards[activeIndex].workflows = syncedWF;
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
      const ogRes = await fetch(
        `http://localhost:3000/api/task/${currentTaskId}`,
        {
          credentials: 'include',
        },
      );
      const ogData = await ogRes.json();
      const parentId = ogData.task.parentId;
      const statusId = ogData.task.statusId;
      const newParentId =
        taskType === 'STORY'
          ? undefined
          : setParent
            ? taskId
            : (parentId ?? undefined);

      const assigneeId: number = await getUserIdFromEmail(assignee, onError);

      if (taskType === 'STORY' && setParent) {
        onError('Story cannot have a parent story');
        return;
      }

      if (isClosed && !isResolved) {
        onError('Closed tasks must be resolved first');
        return;
      }

      if (setParent) {
        const parentTask = taskCache[taskId];
        const workflowIds = new Set(workflowState.map((wf) => wf.id));
        if (!parentTask) {
          onError('Parent task is not available in the board cache');
          return;
        }
        if (parentTask.type !== 'STORY') {
          onError('Parent task must be a story');
          return;
        }
        if (!workflowIds.has(parentTask.statusId)) {
          onError('Parent task must be on the same board');
          return;
        }
      }

      if (projectId) {
        const projectRes = await fetch(
          `http://localhost:3000/api/project/${projectId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );
        const projectData = await projectRes.json();
        const members = projectData.data.members.map(
          (member: ProjectMember) => member.userId,
        );

        if (!members.includes(assigneeId)) {
          onError(
            'Assignee is not a member of the project, failed to edit task',
          );
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
          parentId: taskType === 'STORY' ? null : (newParentId ?? null),
          statusId,
          dueDate: dueDate !== '' ? new Date(dueDate) : null,
          resolvedAt: isResolved ? new Date() : null,
          closedAt: isClosed ? new Date() : null,
        }),
      });

      const sortedWF = await sortWorkflows([...workflowState], onError);
      const nextCache: Record<string, Task> = {
        ...taskCache,
        [currentTaskId]: {
          ...taskCache[currentTaskId],
          id: currentTaskId,
          title: taskName,
          description: taskDescription,
          type: taskType,
          priority,
          assignee: assigneeId,
          reporter: user?.userId ?? taskCache[currentTaskId]?.reporter ?? -1,
          dueDate: dueDate !== '' ? new Date(dueDate) : undefined,
          statusId,
          parentId: newParentId,
          updatedAt: new Date(),
          resolvedAt: isResolved ? new Date() : null,
          closedAt: isClosed ? new Date() : null,
        },
      };

      if (parentId && nextCache[parentId]) {
        const oldParent = nextCache[parentId];
        nextCache[parentId] = {
          ...oldParent,
          children: oldParent.children.filter((id) => id !== currentTaskId),
        };
      }

      if (newParentId && taskType !== 'STORY' && nextCache[newParentId]) {
        const newParent = nextCache[newParentId];
        nextCache[newParentId] = {
          ...newParent,
          children: newParent.children.includes(currentTaskId)
            ? newParent.children
            : [...newParent.children, currentTaskId],
        };
      }

      const syncedWF = syncStoriesWithChildrenOrder(sortedWF, nextCache);
      setTaskCache(nextCache);
      setWorkflowState(syncedWF);
      setDragHighlight(syncedWF.map(() => false));
      boards[activeIndex].workflows = syncedWF;
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
