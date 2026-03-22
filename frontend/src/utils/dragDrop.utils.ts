import type { EdgeConstraint, Task, Workflow } from '../types/boards.types';
import type { Board } from '../types/project.types';
import { sortWorkflows } from './board.utils';

const dragData = {
  itemType: 'text/x-taskboard-item-type',
  columnOrderId: 'text/x-taskboard-column-order-id',
  taskId: 'text/x-taskboard-task-id',
  originColumnId: 'text/x-taskboard-origin-column-id',
  taskType: 'text/x-taskboard-task-type',
  taskHasChildren: 'text/x-taskboard-task-has-children',
} as const;

export function dragstartHandler(event: React.DragEvent<HTMLDivElement>) {
  event.stopPropagation();
  console.log('column drag start');
  event.dataTransfer.setData(dragData.itemType, 'column');
  event.dataTransfer.setData(dragData.columnOrderId, event.currentTarget.id);
}

export function taskDragstartHandler(
  event: React.DragEvent<HTMLDivElement>,
  workflowState: Workflow[],
  edges: EdgeConstraint[],
  setDragHighlight: React.Dispatch<React.SetStateAction<boolean[]>>,
) {
  console.log('task drag start');
  event.stopPropagation();
  const taskType = event.currentTarget.dataset.tasktype ?? '';
  const childCount = Number(event.currentTarget.dataset.childcount ?? 0);
  const hasChildren = childCount > 0;
  event.dataTransfer.setData(dragData.itemType, 'task');
  event.dataTransfer.setData(
    dragData.taskId,
    event.currentTarget.dataset.id ?? '',
  );
  event.dataTransfer.setData(
    dragData.originColumnId,
    event.currentTarget.dataset.parent ?? '',
  );
  event.dataTransfer.setData(dragData.taskType, taskType);
  event.dataTransfer.setData(
    dragData.taskHasChildren,
    hasChildren ? 'true' : 'false',
  );

  if (taskType === 'STORY' && hasChildren) {
    const originId = event.currentTarget.dataset.parent ?? '';
    const originIdx = workflowState.findIndex(
      (workflow) => workflow.id === originId,
    );
    const allowed = workflowState.map((workflow, idx) => {
      void workflow;
      return idx === originIdx;
    });
    setDragHighlight(allowed);
    return;
  }

  const allowed: boolean[] = workflowState.map(() => true);
  for (const edge of edges) {
    const idx = workflowState.findIndex((workflow) => workflow.id === edge.vId);
    if (edge.uId === event.currentTarget.dataset.parent) {
      allowed[idx] = false;
    }
  }
  setDragHighlight(allowed);
}

export function syncStoriesWithChildrenOrder(
  workflows: Workflow[],
  taskCache: Record<string, Task>,
): Workflow[] {
  if (Object.keys(taskCache).length === 0) {
    return workflows;
  }

  const workflowIndexById = new Map<string, number>();
  const workflowOrderById = new Map<string, number>();
  const taskToWorkflowId = new Map<string, string>();

  const nextWorkflows = workflows.map((workflow, index) => {
    workflowIndexById.set(workflow.id, index);
    workflowOrderById.set(workflow.id, workflow.orderIdx);
    workflow.tasks.forEach((taskId) =>
      taskToWorkflowId.set(taskId, workflow.id),
    );
    return {
      ...workflow,
      tasks: [...workflow.tasks],
    };
  });

  for (const task of Object.values(taskCache)) {
    if (task.type !== 'STORY' || !task.children || task.children.length === 0) {
      continue;
    }

    let bestWorkflowId = '';
    let bestOrderIdx = Number.POSITIVE_INFINITY;

    for (const childId of task.children) {
      const childTask = taskCache[childId];
      if (!childTask) {
        continue;
      }
      const childWorkflowId = childTask.statusId;
      const childOrderIdx = workflowOrderById.get(childWorkflowId);
      if (childOrderIdx !== undefined && childOrderIdx < bestOrderIdx) {
        bestOrderIdx = childOrderIdx;
        bestWorkflowId = childWorkflowId;
      }
    }

    if (!bestWorkflowId) {
      continue;
    }

    const currentWorkflowId = taskToWorkflowId.get(task.id);
    if (!currentWorkflowId || currentWorkflowId === bestWorkflowId) {
      continue;
    }

    const currentIdx = workflowIndexById.get(currentWorkflowId);
    const targetIdx = workflowIndexById.get(bestWorkflowId);
    if (currentIdx === undefined || targetIdx === undefined) {
      continue;
    }

    nextWorkflows[currentIdx].tasks = nextWorkflows[currentIdx].tasks.filter(
      (id) => id !== task.id,
    );
    if (!nextWorkflows[targetIdx].tasks.includes(task.id)) {
      nextWorkflows[targetIdx].tasks = [
        ...nextWorkflows[targetIdx].tasks,
        task.id,
      ];
    }
    taskToWorkflowId.set(task.id, bestWorkflowId);
  }

  return nextWorkflows;
}

export async function dropHandler(
  event: React.DragEvent<HTMLDivElement>,
  workflows: Workflow[],
  activeBoard: Board,
  boards: Board[],
  activeIndex: number,
  setWorkflowState: React.Dispatch<React.SetStateAction<Workflow[]>>,
  setDragHighlight: React.Dispatch<React.SetStateAction<boolean[]>>,
  handleError: (message: string) => void,
  edges: EdgeConstraint[],
  dragHighlight: boolean[],
  workflowState: Workflow[],
  taskCache: Record<string, Task>,
  setTaskCache: React.Dispatch<React.SetStateAction<Record<string, Task>>>,
) {
  event.stopPropagation();
  event.preventDefault();
  const dragItemType = event.dataTransfer.getData(dragData.itemType);
  const draggedColumnOrderId = event.dataTransfer.getData(
    dragData.columnOrderId,
  );
  const draggedTaskId = event.dataTransfer.getData(dragData.taskId);
  const draggedOriginColumnId = event.dataTransfer.getData(
    dragData.originColumnId,
  );
  const draggedTaskType = event.dataTransfer.getData(dragData.taskType);
  const draggedTaskHasChildren =
    event.dataTransfer.getData(dragData.taskHasChildren) === 'true';
  setDragHighlight(dragHighlight.map(() => false));
  if (event.currentTarget.dataset.column === 'true') {
    if (dragItemType === 'task') {
      const currColId = workflows[Number(event.currentTarget.id)].id;
      if (
        draggedTaskType === 'STORY' &&
        draggedTaskHasChildren &&
        draggedOriginColumnId !== currColId
      ) {
        handleError(
          'Cannot move a story with existing children. Please move the children first.',
        );
        throw new Error(
          'Cannot move a story with existing children. Please move the children first.',
        );
      }
      // check for wip limit, adjacent column, same columns
      const currCol = currColId;
      const foundEdge = edges.find(
        (edge) => edge.uId === draggedOriginColumnId && edge.vId === currCol,
      );
      if (!foundEdge) {
        handleError('Task transfer not allowed due to edge constraints');
        throw new Error('Task transfer not allowed due to edge constraints');
      }
      const ogColIdx = workflows.find(
        (workflow) => workflow.id === draggedOriginColumnId,
      )?.orderIdx;
      const currColIdx = Number(event.currentTarget.id);
      if (ogColIdx === undefined) {
        return;
      }
      const limit = workflows[currColIdx].limit;
      const taskCount = workflows[currColIdx].tasks.length;
      console.log(currColIdx);
      if (limit !== -1 && taskCount >= limit) {
        handleError('Task transfer not allowed due to WIP limit');
        throw new Error('Task transfer not allowed due to WIP limit');
      }
    }
  }
  async function changeOrder(workflow: Workflow, newOrderIdx: number) {
    try {
      await fetch(
        `http://localhost:3000/api/project/${activeBoard.projectId}/board/${activeBoard.id}/update-column/${workflow.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: workflow.name,
            limit: workflow.limit,
            orderIdx: newOrderIdx,
          }),
        },
      );
      workflow.orderIdx = newOrderIdx;
      const newWorkflowState = [...workflowState];
      const sortedWF = await sortWorkflows(newWorkflowState, () => {}, taskCache);
      const syncedWF = syncStoriesWithChildrenOrder(sortedWF, taskCache);
      setWorkflowState(syncedWF);
      setDragHighlight(syncedWF.map(() => false));
      boards[activeIndex].workflows = syncedWF;
    } catch (err) {
      handleError('Column update failed with');
      throw new Error('Column update failed with error: ', { cause: err });
    }
  }
  if (dragItemType === 'column') {
    const startIdx = Number(draggedColumnOrderId);
    const endIdx = Number(event.currentTarget.id);
    workflows.forEach((workflow) => {
      if (
        endIdx > startIdx &&
        workflow.orderIdx > startIdx &&
        workflow.orderIdx <= endIdx
      ) {
        changeOrder(workflow, workflow.orderIdx - 1);
      } else if (endIdx > startIdx && workflow.orderIdx === startIdx) {
        changeOrder(workflow, endIdx);
      } else if (
        endIdx < startIdx &&
        workflow.orderIdx >= endIdx &&
        workflow.orderIdx < startIdx
      ) {
        changeOrder(workflow, workflow.orderIdx + 1);
      } else if (endIdx < startIdx && workflow.orderIdx === startIdx) {
        changeOrder(workflow, endIdx);
      }
    });
  } else if (dragItemType === 'task') {
    const currCol = Number(event.currentTarget.id);
    const colId = workflows[currCol].id;
    const taskId = draggedTaskId;
    let parentTaskId: string = '';
    let ogParentId = '';
    let subtaskIds: string[] = [];
    try {
      const res1 = await fetch(`http://localhost:3000/api/task/${taskId}`, {
        credentials: 'include',
      });
      const data = await res1.json();
      if (
        data.task.type === 'STORY' &&
        data.task.children &&
        data.task.children.length > 0
      ) {
        handleError(
          'Cannot move a story with existing children. Please move the children first.',
        );
        throw new Error(
          'Cannot move a story with existing children. Please move the children first.',
        );
      }
      parentTaskId = data.task.parentId;
      if (parentTaskId && parentTaskId !== '') {
        const res2 = await fetch(
          `http://localhost:3000/api/task/${parentTaskId}`,
          {
            credentials: 'include',
          },
        );
        const dataParent = await res2.json();
        ogParentId = dataParent.task.statusId;
        console.log('Old parent column: ', ogParentId);
        subtaskIds = dataParent.task.children ?? [];
      }
      const res = await fetch(
        `http://localhost:3000/api/task/update/${taskId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.task.title,
            description: data.task.description,
            type: data.task.type,
            priority: data.task.priority,
            assignee: data.task.assignee,
            reporter: data.task.reporter ?? -1,
            dueDate: data.task.dueDate,
            statusId: colId,
          }),
        },
      );
      const text = await res.text();
      console.log('Task update response: ', text);
      setTaskCache((prev) => {
        const next = { ...prev };
        const cachedTask = next[taskId];
        if (cachedTask) {
          next[taskId] = {
            ...cachedTask,
            statusId: colId,
          };
        }
        return next;
      });
    } catch (err) {
      console.log('Error transferring task: ', { cause: err });
      return;
    }
    const newWFState = workflowState.map((workflow) => {
      if (workflow.id === draggedOriginColumnId) {
        return {
          ...workflow,
          tasks: workflow.tasks.filter((id) => id !== taskId),
        };
      } else if (workflow.id === colId) {
        return {
          ...workflow,
          tasks: [...workflow.tasks, taskId],
        };
      } else {
        return workflow;
      }
    });
    console.log(newWFState);
    let targetParentId = '';
    if (parentTaskId && parentTaskId !== '') {
      try {
        const subtasksColIds = await Promise.all(
          subtaskIds.map(async (subtaskId) => {
            const res = await fetch(
              `http://localhost:3000/api/task/${subtaskId}`,
              {
                credentials: 'include',
              },
            );
            const data = await res.json();
            return data.task.statusId;
          }),
        );
        for (const workflow of newWFState) {
          console.log('Checking workflow ', workflow.orderIdx);
          if (subtasksColIds.some((id) => id === workflow.id)) {
            console.log('Found new parent column: ', workflow.id);
            targetParentId = workflow.id;
            break;
          }
        }
      } catch (err) {
        console.log('Error fetching parent task details: ', { cause: err });
        return;
      }
    }
    const shouldMoveParent =
      parentTaskId &&
      parentTaskId.length > 0 &&
      targetParentId &&
      targetParentId !== ogParentId;
    const newWFState2 = shouldMoveParent
      ? newWFState.map((workflow) => {
          if (workflow.id === ogParentId) {
            return {
              ...workflow,
              tasks: workflow.tasks.filter((id) => id !== parentTaskId),
            };
          }
          if (workflow.id === targetParentId) {
            return {
              ...workflow,
              tasks: workflow.tasks.includes(parentTaskId)
                ? workflow.tasks
                : [...workflow.tasks, parentTaskId],
            };
          }
          return workflow;
        })
      : newWFState;

    if (parentTaskId && parentTaskId.length > 0 && targetParentId) {
      setTaskCache((prev) => {
        const next = { ...prev };
        const cachedParent = next[parentTaskId];
        if (cachedParent) {
          next[parentTaskId] = {
            ...cachedParent,
            statusId: targetParentId,
          };
        }
        return next;
      });
    }

    console.log(newWFState2);
    const sortedWF = await sortWorkflows(newWFState2, () => {}, taskCache);
    setWorkflowState(sortedWF);
    setDragHighlight(sortedWF.map(() => false));
    boards[activeIndex].workflows = sortedWF;
  }
}

export function dragoverHandler(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
}
