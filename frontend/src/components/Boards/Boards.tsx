import { useContext, useEffect, useState } from 'react';
import styles from './boards.module.css';
import formStyles from '../Projects/CreateProject.module.css';
import type { Board } from '../../types/project.types';
import { KanbanColumn } from './KanbanColumn';
import type { Task, Workflow } from '../../types/boards.types';
import { addWorkflow } from '../../utils/board.utils';
import { useParams } from 'react-router-dom';
import { IconPlus } from './boards.images';
import Button from '../Button/Button';
import type { SubmitEventHandler } from 'react';
import Modal from '../Modal/Modal';
import { AuthContext } from '../../context/AuthContext';
import Form, { FormControl, InputArea, Label } from '../Forms/Form';
import { TaskCard } from './TaskCard';

interface Props {
  boards: Board[];
}

export type TaskType = 'STORY' | 'TASK' | 'BUG';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

async function sortWorkflows(workflows: Workflow[]): Promise<Workflow[]> {
  // use for sorting, commented out later.
  async function getDate(taskId: string) {
    try {
      const res = await fetch(`http://localhost:3000/api/task/${taskId}`, {
        credentials: 'include',
      });
      const resJson = await res.json();
      return {
        date: resJson.task.dueDate ? new Date(resJson.task.dueDate) : null,
        priority: resJson.task.priority,
      };
    } catch (err) {
      throw new Error('Error fetching task details: ', { cause: err });
    }
  }
  const newWF = await Promise.all(
    workflows.map(async (workflow) =>
      Promise.all(
        workflow.tasks.map(async (task) => {
          const data = await getDate(task);
          return {
            taskId: task,
            date: data.date,
            priority: data.priority,
          };
        }),
      ),
    ),
  );
  const sorted = newWF.map((workflow) => {
    return workflow.sort((a, b) => {
      const dateA = a.date;
      const dateB = b.date;
      if (dateA && dateB) {
        const diff = dateA.getTime() - dateB.getTime();
        const day_diff = Math.round(diff / (1000 * 3600 * 24));
        if (day_diff === 0) {
          if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
          else if (a.priority !== 'CRITICAL' && b.priority === 'CRITICAL')
            return 1;
          else if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
          else if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
          else if (a.priority === 'MEDIUM' && b.priority !== 'MEDIUM')
            return -1;
          else if (a.priority !== 'MEDIUM' && b.priority === 'MEDIUM') return 1;
          else return 0;
        } else return day_diff;
      }
      if (dateA && !dateB) return -1;
      else if (!dateA && dateB) return 1;
      else {
        if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
        else if (a.priority !== 'CRITICAL' && b.priority === 'CRITICAL')
          return 1;
        else if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
        else if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
        else if (a.priority === 'MEDIUM' && b.priority !== 'MEDIUM') return -1;
        else if (a.priority !== 'MEDIUM' && b.priority === 'MEDIUM') return 1;
        else return 0;
      }
    });
  });
  return workflows.map((workflow, idx) => {
    return { ...workflow, tasks: sorted[idx].map((task) => task.taskId) };
  });
}

function ShowChildrenModal({ children }: { children: Task[] | null }) {
  if(!children) return [];
  return(
    <>
      <div className={styles.childContainer}>
        {children.map((child) => 
          <TaskCard
            key={child.id}
            task={child}
            showDelete={false}
            showSettings={false}
            draggable={false}
            dragstartHandler={() => {}}
          />
        )}
      </div>
    </>
  );
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

  const { user } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBoard = boards[activeIndex];
  const [workflowState, setWorkflowState] = useState(activeBoard.workflows);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  useEffect(() => {
    setWorkflowState(activeBoard.workflows);
  }, [activeIndex]);

  const { pid: projectId } = useParams();
  const [boardName, setBoardName] = useState<string>('');
  const [boardLimit, setBoardLimit] = useState<number>(0);

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('STORY');
  const [priority, setPriority] = useState<Priority>('LOW');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [taskId, setTaskId] = useState('');
  const [setParent, setSetParent] = useState(false);
  const [showChild, setShowChild] = useState(false);
  const [showChildOf, setShowChildOf] = useState<Task[] | null>(null);
  const [showEdgeModal, setShowEdgeModal] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const setState = {
    setTaskName: setTaskName,
    setTaskDescription: setTaskDescription,
    setTaskType: setTaskType,
    setPriority: setPriority,
    setAssignee: setAssignee,
    setDueDate: setDueDate,
    setEditModal: setEditModal,
    setCurrentTaskId: setCurrentTaskId,
    setTaskId: setTaskId,
    setShowChild: setShowChild,
    setShowChildOf: setShowChildOf,
  };

  function dragstartHandler(event: React.DragEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.dataTransfer.setData('type', 'column');
    event.dataTransfer.setData('columnOrderId', event.currentTarget.id);
  }

  function taskDragstartHandler(event: React.DragEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.dataTransfer.setData('type', 'task');
    event.dataTransfer.setData('taskId', event.currentTarget.dataset.id ?? '');
    event.dataTransfer.setData(
      'ogCol',
      event.currentTarget.dataset.parent ?? '',
    );
    console.log(event.currentTarget.dataset.parent);
  }

  async function dropHandler(
    event: React.DragEvent<HTMLDivElement>,
    workflows: Workflow[],
  ) {
    if (event.currentTarget.dataset.column === 'true') {
      const type = event.dataTransfer.getData('type');
      if (type === 'task') {
        // check for wip limit, adjacent column, same columns
        const ogCol = event.dataTransfer.getData('ogCol');
        const currCol = workflows[Number(event.currentTarget.id)].id;
        if (ogCol === currCol) return;
        const ogColIdx = workflows.find(
          (workflow) => workflow.id === ogCol,
        )?.orderIdx;
        const currColIdx = Number(event.currentTarget.id);
        if (ogColIdx === undefined) return;
        if (ogColIdx + 1 !== currColIdx) return;
        const limit = workflows[currColIdx].limit;
        const taskCount = workflows[currColIdx].tasks.length;
        console.log(currColIdx);
        if (limit != -1 && taskCount >= limit) return;
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
        boards[activeIndex].workflows = sortedWF;
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
      const ogCol = event.dataTransfer.getData('ogCol');
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
              reporter: user?.userId,
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
      const newWF = workflows.map((workflow) => {
        if (workflow.id === colId) {
          return {
            ...workflow,
            tasks: [...workflow.tasks, taskId],
          };
        } else if (workflow.id === ogCol) {
          return {
            ...workflow,
            tasks: workflow.tasks.filter((id) => id !== taskId),
          };
        }
        return workflow;
      });
      const sortedWF = await sortWorkflows(newWF);
      setWorkflowState(sortedWF);
      boards[activeIndex].workflows = sortedWF;
    }
  }

  function dragoverHandler(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  async function getUserIdFromEmail(email: string): Promise<number> {
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
      throw new Error('Error fetching user id from email: ', { cause: err });
    }
  }

  const handleAdd: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!projectId || !activeBoard) {
      return;
    }

    const assigneeId: number = await getUserIdFromEmail(assignee);
    const reporterId: number = user?.userId ?? -1;
    const dateObject = dueDate !== '' ? new Date(dueDate) : null;

    try {
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
          assignee: assigneeId,
          reporter: reporterId,
          dueDate: dateObject,
          statusId: activeColumnId,
          parentId: setParent ? taskId : null,
        }),
      });
      const data = await res.json();
      const newTaskId = data.taskId;
      const newWF = workflowState.map((workflow) =>
        workflow.id === activeColumnId
          ? ({
              ...workflow,
              tasks: [...workflow.tasks, newTaskId],
            } as Workflow)
          : workflow,
      );
      const sortedWF = await sortWorkflows(newWF);
      setWorkflowState(sortedWF);
      boards[activeIndex].workflows = sortedWF;
    } catch (err) {
      console.error('Error creating task:', { cause: err });
    } finally {
      setShowAddTaskModal(false);
      setTaskName('');
      setTaskDescription('');
      setTaskType('STORY');
      setPriority('LOW');
      setAssignee('');
      setDueDate('');
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const ogres = await fetch(
        `http://localhost:3000/api/task/${currentTaskId}`,
        {
          credentials: 'include',
        },
      );
      const ogdata = await ogres.json();
      const assigneeId: number = ogdata.task.assignee;
      const parentId = ogdata.task.parentId;
      const statusId = ogdata.task.statusId;
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
          priority: priority,
          reporter: user?.userId,
          assignee: assigneeId,
          parentId: setParent ? taskId : parentId,
          statusId: statusId,
          dueDate: dueDate !== '' ? new Date(dueDate) : null,
        }),
      });
      console.log(setParent, taskId, parentId);
      const newWF = workflowState.map((workflow) => workflow);
      const sortedWF = await sortWorkflows(newWF);
      setWorkflowState(sortedWF);
      boards[activeIndex].workflows = sortedWF;
    } catch (err) {
      console.error('Error editing task: ', { cause: err });
    } finally {
      setEditModal(false);
      setTaskName('');
      setTaskDescription('');
      setTaskType('STORY');
      setPriority('LOW');
      setAssignee('');
      setDueDate('');
      setCurrentTaskId(null);
    }
  };

  return (
    <>
      <>
        {showAddTaskModal && (
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
              <Form onSubmit={handleAdd}>
                <InputArea>
                  <Label htmlFor="name">Task Name</Label>
                  <FormControl
                    type="text"
                    placeholder="e.g. Create QGraphicsScene"
                    name="taskName"
                    id="taskName"
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                    value={taskName}
                  />
                </InputArea>
                <InputArea>
                  <Label htmlFor="description">Description</Label>
                  <FormControl
                    type="text"
                    placeholder="e.g. Create QGraphicsScene for rendering SVG elements"
                    name="taskDescription"
                    id="taskDescription"
                    onChange={(e) => setTaskDescription(e.target.value)}
                    required
                    value={taskDescription}
                  />
                </InputArea>
                <InputArea>
                  <Label htmlFor="taskType">Task Type</Label>
                  <select
                    name="taskType"
                    id="taskType"
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    value={taskType}
                  >
                    <option value="STORY">Story</option>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                  </select>
                </InputArea>
                <InputArea>
                  <Label htmlFor="taskPriority">Priority</Label>
                  <select
                    name="taskPriority"
                    id="taskPriority"
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    value={priority}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </InputArea>
                <InputArea>
                  <Label htmlFor="assignee">Assignee</Label>
                  <FormControl
                    type="email"
                    placeholder="e.g. johndoe@taskboard.com"
                    name="assignee"
                    id="assignee"
                    onChange={(e) => setAssignee(e.target.value)}
                    required
                    value={assignee}
                  />
                </InputArea>
                <InputArea>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <FormControl
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    onChange={(e) => setDueDate(e.target.value)}
                    value={dueDate}
                  />
                </InputArea>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
                  <Label htmlFor="showParent">Set parent story</Label>
                  <input 
                    type='checkbox'
                    name='showParent'
                    checked={setParent}
                    onChange={(e) => setSetParent(e.target.checked)}
                    disabled={taskType === 'STORY'}
                  />
                </div>
                {setParent && <InputArea>
                  <Label htmlFor="parentTask">parentTask (contains last copied task ID)</Label>
                  <FormControl
                    type="string"
                    name="parentTask"
                    id="parentTask"
                    value={taskId}
                    disabled
                  />
                </InputArea>}
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
              </Form>
            </div>
          </Modal>
        )}
        {editModal && (
          <Modal
            onclick={() => {
              setEditModal(false);
              setCurrentTaskId(null);
            }}
          >
            <div>
              <h2
                style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  fontWeight: '700',
                }}
              >
                Edit Task
              </h2>
              <Form onSubmit={handleEdit}>
                <InputArea>
                  <Label htmlFor="name">Task Name</Label>
                  <FormControl
                    type="text"
                    placeholder="e.g. Create QGraphicsScene"
                    name="taskName"
                    id="taskName"
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                    value={taskName}
                  />
                </InputArea>
                <InputArea>
                  <Label htmlFor="description">Description</Label>
                  <FormControl
                    type="text"
                    placeholder="e.g. Create QGraphicsScene for rendering SVG elements"
                    name="taskDescription"
                    id="taskDescription"
                    onChange={(e) => setTaskDescription(e.target.value)}
                    required
                    value={taskDescription}
                  />
                </InputArea>
                <InputArea>
                  <label htmlFor="taskType">Task Type</label>
                  <select
                    name="taskType"
                    id="taskType"
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    value={taskType}
                  >
                    <option value="STORY">Story</option>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                  </select>
                </InputArea>
                <InputArea>
                  <label htmlFor="taskPriority">Priority</label>
                  <select
                    name="taskPriority"
                    id="taskPriority"
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    value={priority}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </InputArea>
                <InputArea>
                  <Label htmlFor="assignee">Assignee</Label>
                  <FormControl
                    type="email"
                    placeholder="e.g. johndoe@taskboard.com"
                    name="assignee"
                    id="assignee"
                    onChange={(e) => setAssignee(e.target.value)}
                    required
                    value={assignee}
                  />
                </InputArea>
                <InputArea>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <FormControl
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    onChange={(e) => setDueDate(e.target.value)}
                    value={dueDate}
                  />
                </InputArea>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
                  <Label htmlFor="showParent">Set parent story (uncheck to keep same parent)</Label>
                  <input 
                    type='checkbox'
                    name='showParent'
                    checked={setParent}
                    onChange={(e) => setSetParent(e.target.checked)}
                    disabled={taskType === 'STORY'}
                    defaultChecked={false}
                  />
                </div>
                <InputArea>
                  <Label htmlFor="parentTask">parentTask (contains last copied task ID)</Label>
                  <FormControl
                    type="string"
                    name="parentTask"
                    id="parentTask"
                    value={taskType === 'STORY' ? '' : taskId}
                    disabled
                  />
                </InputArea>
                <div className={formStyles.buttonGroup}>
                  <Button
                    priority="second"
                    type="button"
                    onClick={() => setEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button priority="first" type="submit">
                    Edit Task
                  </Button>
                </div>
              </Form>
            </div>
          </Modal>
        )}
        {showEdgeModal && <Modal onclick={() => setShowEdgeModal(false)}>
          <h2>Manage Task Transitions</h2>
          {/* {activeBoard.} */}
        </Modal>}
        {showChild && <Modal onclick={() => setShowChild(false)}>
            <ShowChildrenModal children={showChildOf} />
          </Modal>}
      </>
      <div className={styles.container}>
        <div className={styles.tabList} role="tablist" style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                  }}
                >
                  {board.name}
                </button>
              );
            })}
          </div>
          <Button
            onClick={
              () => setShowEdgeModal(true)
            }>
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
                .map((workflow) => {
                  return (
                    <KanbanColumn
                      key={`${activeBoard.id}-${workflow.id}`}
                      id={workflow.orderIdx.toString()}
                      workflow={workflow}
                      onAddTask={() => {
                        if (
                          workflow.tasks.length >= workflow.limit &&
                          workflow.limit !== -1
                        )
                          return;
                        setShowAddTaskModal(true);
                        setActiveColumnId(workflow.id);
                      }}
                      draggable={true}
                      dragstartHandler={dragstartHandler}
                      dropHandler={(e) => dropHandler(e, workflowState)}
                      dragoverHandler={dragoverHandler}
                      taskDragstartHandler={taskDragstartHandler}
                      setState={setState}
                    />
                  );
                })}

              {activeBoard && (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <button
                    className={styles.columnAddBtn}
                    onClick={() => {
                      setIsAdding(!isAdding);
                    }}
                  >
                    <IconPlus />
                  </button>
                  {isAdding && (
                    <div className={styles.addColumnMenu}>
                      <FormControl
                        name="col-name"
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        placeholder="Column Name"
                      />
                      <FormControl
                        placeholder="Limit"
                        type="number"
                        value={boardLimit}
                        name="limit"
                        onChange={(e) => setBoardLimit(e.target.valueAsNumber)}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Button
                          onClick={() => {
                            if(boardName === ''){
                              setIsAdding(false);
                              return;
                            }
                            let ret = false;
                            activeBoard.workflows.map((workflow) => {
                              if(workflow.name.toLowerCase() === boardName.toLowerCase()){
                                ret = true;
                              }
                            });
                            if(ret){
                              setIsAdding(false);
                              return;
                            }
                            addWorkflow(
                              activeBoard.id,
                              boardName,
                              workflowState.length,
                              projectId ?? '',
                              boardLimit,
                            )
                              .then((column) => {
                                setWorkflowState([...workflowState, column]);
                                boards[activeIndex].workflows = [...workflowState, column];
                              })
                              .finally(() => {
                                setBoardName('');
                                setBoardLimit(0);
                              });
                              setIsAdding(false);
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
