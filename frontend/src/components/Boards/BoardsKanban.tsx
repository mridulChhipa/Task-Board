import styles from './boards.module.css';
import Button from '../Button/Button';
import { handleError } from '../../App';
import { KanbanColumn } from './KanbanColumn';
import EditWorkflowButton from './EditWorkflowButton';
import {
  dragoverHandler,
  dragstartHandler,
  dropHandler,
  taskDragstartHandler,
} from '../../utils/dragDrop.utils';
import type { BoardsKanbanProps } from './BoardsView.types';

export default function BoardsKanban({
  boards,
  activeIndex,
  setActiveIndex,
  activeBoard,
  workflowState,
  setWorkflowState,
  taskCache,
  setTaskCache,
  dragHighlight,
  setDragHighlight,
  boardRefreshKey,
  setShowAddTaskModal,
  setActiveColumnId,
  role,
  projectId,
  edges,
  isAdding,
  setIsAdding,
  boardName,
  setBoardName,
  boardLimit,
  setBoardLimit,
  boardHandlers,
  setState,
  setShowViewEdgesModal,
}: BoardsKanbanProps) {
  return (
    <div className={styles.container}>
      <div
        className={styles.tabList}
        role="tablist"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {boards.map((board, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={`board-panel-${idx}`}
                id={`board-tab-${idx}`}
                className={`${styles.tab} ${isActive ? styles.active : ''}`}
                onClick={() => {
                  setActiveIndex(idx);
                  setWorkflowState(boards[idx].workflows);
                  setDragHighlight(boards[idx].workflows.map(() => false));
                }}
              >
                {board.name}
              </button>
            );
          })}
        </div>
        <Button
          onClick={() => {
            setShowViewEdgesModal(true);
            console.log(role);
          }}
        >
          Transitions
        </Button>
      </div>
      {activeBoard && (
        <div
          role="tabpanel"
          id={`board-panel-${activeIndex}`}
          aria-labelledby={`board-tab-${activeIndex}`}
          className={styles.panel}
        >
          <div className={styles.kanbanBoard}>
            {workflowState
              .sort((a, b) => a.orderIdx - b.orderIdx)
              .map((workflow, index) => {
                return (
                  <KanbanColumn
                    key={`${activeBoard.id}-${workflow.id}-${boardRefreshKey}`}
                    id={workflow.orderIdx.toString()}
                    workflow={workflow}
                    highlight={dragHighlight[index]}
                    onAddTask={() => {
                      if (
                        workflow.tasks.length >= workflow.limit &&
                        workflow.limit !== -1
                      ) {
                        return;
                      }
                      setShowAddTaskModal(true);
                      setActiveColumnId(workflow.id);
                    }}
                    deleteColumn={async () =>
                      await boardHandlers.deleteColumn(workflow.id)
                    }
                    renameColumn={async (name) =>
                      await boardHandlers.renameColumn(workflow.id, name)
                    }
                    role={role}
                    draggable={role === 'PROJECT_ADMIN'}
                    dragstartHandler={
                      role === 'PROJECT_ADMIN' ? dragstartHandler : undefined
                    }
                    dropHandler={(e) =>
                      dropHandler(
                        e,
                        workflowState,
                        activeBoard,
                        boards,
                        activeIndex,
                        setWorkflowState,
                        setDragHighlight,
                        handleError,
                        edges,
                        dragHighlight,
                        workflowState,
                        taskCache,
                        setTaskCache,
                      )
                    }
                    dragoverHandler={dragoverHandler}
                    taskDragstartHandler={(e) =>
                      taskDragstartHandler(
                        e,
                        workflowState,
                        edges,
                        setDragHighlight,
                      )
                    }
                    setTaskCache={setTaskCache}
                    setState={setState}
                  />
                );
              })}

            {activeBoard && role === 'PROJECT_ADMIN' && (
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <EditWorkflowButton
                  isAdding={isAdding}
                  setIsAdding={setIsAdding}
                  boardName={boardName}
                  setBoardName={setBoardName}
                  boardLimit={boardLimit}
                  setBoardLimit={setBoardLimit}
                  workflowState={workflowState}
                  setWorkflowState={setWorkflowState}
                  projectId={projectId}
                  activeBoard={activeBoard}
                  boards={boards}
                  activeIndex={activeIndex}
                  dragHighlight={dragHighlight}
                  setDragHighlight={setDragHighlight}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
