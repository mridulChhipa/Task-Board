import { useEffect, useState } from 'react';
import styles from './boards.module.css';
import formStyles from '../Projects/CreateProject.module.css';
import type { Board } from '../../types/project.types';
import { KanbanColumn } from './KanbanColumn';
import type { Workflow } from '../../types/boards.types';
import { addWorkflow } from '../../utils/board.utils';
import { useParams } from 'react-router-dom';
import { IconPlus } from './boards.images';
import Button from '../Button/Button';
import type { SubmitEventHandler } from 'react';
import Modal from '../Modal/Modal';

interface Props {
  boards: Board[];
}

export default function Boards({ boards }: Props) {
  if (boards.length === 0) {
    return (
      <>
        <br />
        <h1>Start Working</h1>
      </>
    );
  }
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBoard = boards[activeIndex];
  const [workflowState, setWorkflowState] = useState(activeBoard.workflows);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    setWorkflowState(activeBoard.workflows);
  }, [activeIndex]);

  console.log(boards);

  const { pid: projectId } = useParams();
  const [boardName, setBoardName] = useState<string>('');
  const [boardLimit, setBoardLimit] = useState<number>(0);

  const[taskName, setTaskName] = useState('');
  const[taskDescription, setTaskDescription] = useState('');
  type TaskType = "STORY" | "TASK" | "BUG";
  const[taskType, setTaskType] = useState<TaskType>("STORY");
  type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  const[priority, setPriority] = useState<Priority>("LOW");
  const[assignee, setAssignee] = useState('');
  const[reporter, setReporter] = useState('');
  const[dueDate, setDueDate] = useState('');

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
    event.stopPropagation();
    console.log("Dropped on column with orderIdx: " + event.currentTarget.id);
    async function changeOrder(workflow: Workflow, newOrderIdx: number) {
      try{
        await fetch(`http://localhost:3000/api/project/${activeBoard.projectId}/board/${activeBoard.id}/update-column/${workflow.id}`, {
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
        });
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
        }
        else if(endIdx > startIdx && workflow.orderIdx === startIdx) {
          changeOrder(workflow, endIdx);
        }
        else if(endIdx < startIdx && workflow.orderIdx >= endIdx && workflow.orderIdx < startIdx) {
          changeOrder(workflow, workflow.orderIdx + 1);
        }
        else if(endIdx < startIdx && workflow.orderIdx === startIdx) {
          changeOrder(workflow, endIdx);
        }
      });
    }
    else if(event.dataTransfer.getData('type') === 'task') {
      // enter task drop logic
    }
  }

  function dragoverHandler(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  const handleAdd: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if(!projectId || !activeBoard) {
      return;
    }

    try{
      const res = await fetch(`http://localhost:3000/api/task/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskName,
          description: taskDescription,
          type: taskType,
          priority: priority,
          assignee: assignee,
          reporter: reporter,
          dueDate: dueDate,
          statusId: activeBoard.workflows[0].id, // confirm what this is supposed to be
          parentId: null, // confirm what this is supposed to be
          stackPosition: 0, // set to last position in column, store that as well.
        }),
      });
      const data = await res.json();
      console.log(data);
      // update task state in frontend
    } catch (err) {
      console.error('Error creating task:', {cause: err});
    }
    finally {
      setShowAddTaskModal(false);
      setTaskName('');
      setTaskDescription('');
      setTaskType('STORY');
      setPriority('LOW');
      setAssignee('');
      setReporter('');
      setDueDate('');
    }
  };

  return (
    <>
      <>
        {
          showAddTaskModal && (
            <Modal onclick={() => setShowAddTaskModal(false)}>
              <div>
                <h2
                  style={{
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    fontWeight: '700',
                  }}
                >
                  Create new Task
                </h2>
                <form className={formStyles.createForm} onSubmit={handleAdd}>
                  <div className={formStyles.inputArea}>
                    <label htmlFor="name" className={formStyles.label}>
                      Task Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Create QGraphicsScene"
                      name="taskName"
                      id="taskName"
                      onChange={(e) => setTaskName(e.target.value)}
                      required
                      className={formStyles.formControl}
                      value={taskName}
                    />
                  </div>
                  <div className={formStyles.inputArea}>
                    <label htmlFor="description" className={formStyles.label}>
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Create QGraphicsScene for rendering SVG elements"
                      name="taskDescription"
                      id="taskDescription"
                      onChange={(e) => setTaskDescription(e.target.value)}
                      required
                      className={formStyles.formControl}
                      value={taskDescription}
                    />
                  </div>
                  <div className={formStyles.inputArea}>
                    <label htmlFor="taskType" className={formStyles.label}>
                      Task Type
                    </label>
                    <select
                      name="taskType"
                      id="taskType"
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      value={taskType}
                      className={formStyles.formControl}
                    >
                      <option value="STORY">Story</option>
                      <option value="TASK">Task</option>
                      <option value="BUG">Bug</option>
                    </select>
                  </div>
                  <div className={formStyles.inputArea}>
                    <label htmlFor="taskPriority" className={formStyles.label}>
                      Priority
                    </label>
                    <select
                      name="taskPriority"
                      id="taskPriority"
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      value={priority}
                      className={formStyles.formControl}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div className={formStyles.inputArea}>
                    <label htmlFor="assignee" className={formStyles.label}>
                      Assignee
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. johndoe@taskboard.com"
                      name="assignee"
                      id="assignee"
                      onChange={(e) => setAssignee(e.target.value)}
                      required
                      className={formStyles.formControl}
                      value={assignee}
                    />
                  </div>
                  <div className={formStyles.inputArea}>
                    <label htmlFor="reporter" className={formStyles.label}>
                      Reporter
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. janedoe@taskboard.com"
                      name="reporter"
                      id="reporter"
                      onChange={(e) => setReporter(e.target.value)}
                      required
                      className={formStyles.formControl}
                      value={reporter}
                    />
                  </div>
                  <div className={formStyles.inputArea}>
                    <label htmlFor="dueDate" className={formStyles.label}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className={formStyles.formControl}
                      value={dueDate}
                    />
                  </div>
                    <div className={formStyles.buttonGroup}>
                    <Button
                      priority="second"
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button priority="first" type="submit">
                      Create Task
                    </Button>
                  </div>
                </form>
              </div>
            </Modal>
          )
        }
      </>
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
                  setWorkflowState(boards[idx].workflows);
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
                      onAddTask={() => setShowAddTaskModal(true)}
                      draggable={true}
                      dragstartHandler={dragstartHandler}
                      dropHandler={(e) => dropHandler(e, workflowState)}
                      dragoverHandler={dragoverHandler}
                    />
                  );
                })}

              {activeBoard && (
                <div style={{ position: 'relative' }}>
                  <button
                    className={styles.columnAddBtn}
                    onClick={() => {
                      setIsAdding(!isAdding);
                    }}
                  >
                    <IconPlus />
                  </button>
                  {isAdding &&
                    <div className={styles.addColumnMenu}>
                      <input
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        placeholder="Column Name"
                        className={styles.formControl}
                      />
                      <input
                        placeholder="Limit"
                        type="number"
                        value={boardLimit}
                        onChange={(e) => setBoardLimit(e.target.valueAsNumber)}
                        className={styles.formControl}
                      />
                      <Button
                        onClick={() => {
                          addWorkflow(
                            activeBoard.id,
                            boardName,
                            workflowState.length,
                            projectId ?? '',
                            boardLimit,
                          ).then((column) => {
                            setWorkflowState([...workflowState, column]);
                          }).finally(() => {
                            setBoardName('');
                            setBoardLimit(0);
                          });
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
