import { API_URL } from '../config';
import type { SubmitEventHandler } from 'react';
import type { EdgeConstraint } from '../types/boards.types';
import type {
  RuntimeContext,
  EdgeFormState,
  BoardState,
  BoardSetters,
} from './board.handlers.types';

export function createWorkflowHandlers(
  runtime: RuntimeContext,
  edgeForm: EdgeFormState,
  state: BoardState,
  setters: BoardSetters,
) {
  const { projectId, activeBoard, boards, activeIndex, onError } = runtime;
  const { fromEdgeName, toEdgeName } = edgeForm;
  const { workflowState, edges } = state;

  const { setWorkflowState, setDragHighlight, setIsAddingEdge, setEdges } =
    setters;

  const deleteColumn = async (workflowId: string) => {
    if (!projectId || !activeBoard) {
      return;
    }

    try {
      await fetch(
        `${API_URL}/api/project/${projectId}/board/${activeBoard.id}/remove-column/${workflowId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      activeBoard.workflows = activeBoard.workflows.filter(
        (workflow) => workflow.id !== workflowId,
      );

      const sortedWF = workflowState
        .filter((workflow) => workflow.id !== workflowId)
        .map((workflow, idx) => ({ ...workflow, orderIdx: idx }));

      setWorkflowState(sortedWF);
      setDragHighlight(sortedWF.map(() => false));
    } catch (err) {
      onError('Failed to delete column');
      throw new Error('Error deleting column', { cause: err });
    }
  };

  const renameColumn = async (workflowId: string, name: string) => {
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) {
      return;
    }

    const target = workflowState.find((workflow) => workflow.id === workflowId);
    if (!target) {
      return;
    }

    try {
      await fetch(
        `${API_URL}/api/project/${activeBoard.projectId}/board/${activeBoard.id}/update-column/${workflowId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmedName,
            limit: target.limit,
            orderIdx: target.orderIdx,
          }),
        },
      );

      const updated = workflowState.map((workflow) =>
        workflow.id === workflowId
          ? { ...workflow, name: trimmedName }
          : workflow,
      );

      setWorkflowState(updated);
      setDragHighlight(updated.map(() => false));
      boards[activeIndex].workflows = updated;
    } catch (err) {
      onError('Failed to rename column');
      throw new Error('Error renaming column', { cause: err });
    }
  };

  const handleAddEdge: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      if (!projectId || !activeBoard) {
        return;
      }

      let fromEdgeId = '';
      let toEdgeId = '';
      setIsAddingEdge(false);

      if (fromEdgeName.toLowerCase() === toEdgeName.toLowerCase()) {
        onError('Cannot create edge between the same columns');
        throw new Error('Cannot create edge between the same columns');
      }

      for (const workflow of workflowState) {
        if (workflow.name === fromEdgeName.toLowerCase().trim()) {
          fromEdgeId = workflow.id;
        }
        if (workflow.name === toEdgeName.toLowerCase().trim()) {
          toEdgeId = workflow.id;
        }
      }

      if (fromEdgeId === '' || toEdgeId === '') {
        onError('Invalid workflow names entered for edge creation');
        throw new Error('Invalid workflow names entered for edge creation');
      }

      const response = await fetch(
        `${API_URL}/api/project/${projectId}/board/${activeBoard.id}/create-edge`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceColId: fromEdgeId,
            targetColId: toEdgeId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        onError(`Failed to add edge: ${errorData.message}`);
        throw new Error(`Error adding edge: ${errorData.message}`);
      }

      const res = await response.json();
      const newEdge: EdgeConstraint = res.edge;
      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      activeBoard.edges = updatedEdges;
    } catch (err) {
      console.error('Error adding edge:', { cause: err });
    }
  };

  return {
    deleteColumn,
    renameColumn,
    handleAddEdge,
  };
}
