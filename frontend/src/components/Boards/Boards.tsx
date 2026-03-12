import { useEffect, useState } from 'react';
import styles from './boards.module.css';
import type { Board } from '../../types/project.types';
import { KanbanColumn } from './KanbanColumn';
import type { Workflow } from '../../types/boards.types';
import { addWorkflow } from '../../utils/board.utils';
import { useParams } from 'react-router-dom';
import { IconPlus } from './boards.images';

interface Props {
  boards: Board[];
}

export default function Boards({ boards }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBoard = boards[activeIndex];
  const [workflowState, setWorkflowState] = useState(activeBoard.workflows);

  useEffect(() => {
    setWorkflowState(activeBoard.workflows);
  }, [activeIndex]);

  console.log(boards);

  const { pid: projectId } = useParams();
  const [boardName, setBoardName] = useState<string>('');
  const [boardLimit, setBoardLimit] = useState<number>(0);

  function dragstartHandler(event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData('type', 'column');
    event.dataTransfer.setData('columnOrderId', event.currentTarget.id);
    console.log('dragging column with orderIdx: ' + event.currentTarget.id);
  }

  async function dropHandler(
    event: React.DragEvent<HTMLDivElement>,
    workflows: Workflow[],
  ) {
    event.preventDefault();
    async function changeOrder(workflow: Workflow, newOrderIdx: number) {
      try {
        const res = await fetch(
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
        const data = await res.json();
        console.log(data);
        workflow.orderIdx = newOrderIdx;
        const newWorkflowState = [...workflowState];
        setWorkflowState(newWorkflowState);
      } catch (err) {
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
          console.log(
            'workflow ' +
              workflow.name +
              ' moved to ' +
              (workflow.orderIdx - 1),
          );
        } else if (endIdx > startIdx && workflow.orderIdx === startIdx) {
          changeOrder(workflow, endIdx);
          console.log('workflow ' + workflow.name + ' moved to ' + endIdx);
        } else if (
          endIdx < startIdx &&
          workflow.orderIdx >= endIdx &&
          workflow.orderIdx < startIdx
        ) {
          changeOrder(workflow, workflow.orderIdx + 1);
          console.log(
            'workflow ' +
              workflow.name +
              ' moved to ' +
              (workflow.orderIdx + 1),
          );
        } else if (endIdx < startIdx && workflow.orderIdx === startIdx) {
          changeOrder(workflow, endIdx);
          console.log('workflow ' + workflow.name + ' moved to ' + endIdx);
        }
      });
      // use setState for columns list, and update in dropHandler
    } else if (event.dataTransfer.getData('type') === 'task') {
      // enter task drop logic
    }
  }

  function dragoverHandler(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist">
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
                // setWorkflowState(activeBoard.workflows);
              }}
            >
              {board.name}
            </button>
          );
        })}
      </div>
      {activeBoard && (
        <div
          role="tabpanel"
          id={`board-panel-${activeIndex}`}
          aria-labelledby={`board-tab-${activeIndex}`}
          className={styles.panel}
        >
          {/* {activeBoard.workflows[0].tasks} */}
          <div className={styles.kanbanBoard}>
            {/* {activeBoard.workflows.length} */}
            {workflowState
              .sort((a, b) => a.orderIdx - b.orderIdx)
              .map((workflow) => {
                return (
                  <KanbanColumn
                    key={`${activeBoard.id}-${workflow.id}`}
                    id={workflow.orderIdx.toString()}
                    workflow={workflow}
                    draggable={true}
                    dragstartHandler={dragstartHandler}
                    dropHandler={(e) => dropHandler(e, workflowState)}
                    dragoverHandler={dragoverHandler}
                  />
                );
              })}

            {activeBoard && (
              <button
                className={styles.columnAddBtn}
                onClick={() => {
                  addWorkflow(
                    activeBoard.id,
                    boardName,
                    boards.length + 1,
                    projectId ? projectId : '',
                    boardLimit,
                  );
                }}
              >
                <IconPlus />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
