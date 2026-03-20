import type {
  BoardHandlers,
  CreateBoardHandlersParams,
} from './board.handlers.types';
import { createTaskHandlers } from './board.task.handlers';
import { createWorkflowHandlers } from './board.workflow.handlers';

export function createBoardHandlers({
  runtime,
  taskForm,
  edgeForm,
  state,
  setters,
}: CreateBoardHandlersParams): BoardHandlers {
  const taskHandlers = createTaskHandlers(runtime, taskForm, state, setters);
  const workflowHandlers = createWorkflowHandlers(
    runtime,
    edgeForm,
    state,
    setters,
  );

  return {
    ...taskHandlers,
    ...workflowHandlers,
  };
}

export type {
  BoardHandlers,
  RuntimeContext,
  TaskFormState,
  EdgeFormState,
  BoardState,
  BoardSetters,
  CreateBoardHandlersParams,
} from './board.handlers.types';
