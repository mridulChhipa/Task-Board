import type { EdgeConstraint, Workflow } from '../types/boards.types';
import type { Board } from '../types/project.types';
import { fetchBoard } from './board.utils';
import type { User } from '../context/AuthContext';
import { sortWorkflows } from './board.utils';

export function dragstartHandler(event: React.DragEvent<HTMLDivElement>) {
  event.stopPropagation();
  event.dataTransfer.setData('type', 'column');
  event.dataTransfer.setData('columnOrderId', event.currentTarget.id);
}

export function taskDragstartHandler(event: React.DragEvent<HTMLDivElement>, workflowState: Workflow[], edges: EdgeConstraint[], setDragHighlight: React.Dispatch<React.SetStateAction<boolean[]>>) {
  event.stopPropagation();
  event.dataTransfer.setData('type', 'task');
  event.dataTransfer.setData('taskId', event.currentTarget.dataset.id ?? '');
  event.dataTransfer.setData(
    'ogCol',
    event.currentTarget.dataset.parent ?? '',
  );
  let allowed: boolean[] = workflowState.map(() => true);
    for(const edge of edges){
    const idx = workflowState.findIndex((workflow) => workflow.id === edge.vId);
    if(edge.uId === event.currentTarget.dataset.parent) allowed[idx] = false;
  }
  setDragHighlight(allowed);
}

export async function dropHandler(
  event: React.DragEvent<HTMLDivElement>,
  workflows: Workflow[],
  projectId: string | undefined,
  activeBoard: Board,
  boards: Board[],
  activeIndex: number,
  setWorkflowState: React.Dispatch<React.SetStateAction<Workflow[]>>,
  setDragHighlight: React.Dispatch<React.SetStateAction<boolean[]>>,
  setEdges: React.Dispatch<React.SetStateAction<EdgeConstraint[]>>,
  setBoardRefreshKey: React.Dispatch<React.SetStateAction<number>>,
  handleError: (message: string) => void,
  edges: EdgeConstraint[],
  dragHighlight: boolean[],
  workflowState: Workflow[],
  user: User | null,
) {
  async function refreshActiveBoard() {
    if (!projectId) return;
    const freshBoard = await fetchBoard(activeBoard.id, projectId);
    const nextEdges = (freshBoard as Board & { edgeConstraints?: EdgeConstraint[] }).edgeConstraints ?? freshBoard.edges ?? [];
    setWorkflowState(freshBoard.workflows);
    setDragHighlight(freshBoard.workflows.map(() => false));
    setEdges(nextEdges);
    boards[activeIndex].workflows = freshBoard.workflows;
    boards[activeIndex].edges = nextEdges;
    setBoardRefreshKey((prev) => prev + 1);
  }
  setDragHighlight(dragHighlight.map(() => false));
  if (event.currentTarget.dataset.column === 'true') {
    const type = event.dataTransfer.getData('type');
    if (type === 'task') {
      // check for wip limit, adjacent column, same columns
      const ogCol = event.dataTransfer.getData('ogCol');
      const currCol = workflows[Number(event.currentTarget.id)].id;
      const foundEdge = edges.find((edge) => edge.uId === ogCol && edge.vId === currCol);
      if (!foundEdge) {
        handleError('Task transfer not allowed due to edge constraints');
        throw new Error ('Task transfer not allowed due to edge constraints');
      }
      const ogColIdx = workflows.find(
        (workflow) => workflow.id === ogCol,
      )?.orderIdx;
      const currColIdx = Number(event.currentTarget.id);
      if (ogColIdx === undefined) return;
      const limit = workflows[currColIdx].limit;
      const taskCount = workflows[currColIdx].tasks.length;
      console.log(currColIdx);
      if (limit != -1 && taskCount >= limit) {
        handleError('Task transfer not allowed due to WIP limit');
        throw new Error('Task transfer not allowed due to WIP limit');
      }
    }
    event.preventDefault();
  }
  event.stopPropagation();
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
      const sortedWF = await sortWorkflows(newWorkflowState);
      setWorkflowState(sortedWF);
      setDragHighlight(sortedWF.map(() => false));
      boards[activeIndex].workflows = sortedWF;
    } catch (err) {
      handleError('Column update failed with');
      throw new Error('Column update failed with error: ', { cause: err });
    }
  }
  if (event.dataTransfer.getData('type') === 'column') {
    const startIdx = Number(event.dataTransfer.getData('columnOrderId'));
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
  } else if (event.dataTransfer.getData('type') === 'task') {
    const currCol = Number(event.currentTarget.id);
    const colId = workflows[currCol].id;
    // const ogCol = event.dataTransfer.getData('ogCol');
    const taskId = event.dataTransfer.getData('taskId');
    try {
      const res1 = await fetch(`http://localhost:3000/api/task/${taskId}`, {
        credentials: 'include',
      });
      const data = await res1.json();
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
            reporter: user?.userId ?? -1,
            dueDate: data.task.dueDate,
            statusId: colId,
          }),
        },
      );
      const text = await res.text();
      console.log('Task update response: ', text);
    } catch (err) {
      console.log('Error transferring task: ', { cause: err });
      return;
    }
    await refreshActiveBoard();
  }
}

export function dragoverHandler(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
}