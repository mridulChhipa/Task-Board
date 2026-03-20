import { useEffect, useState, type SubmitEvent } from 'react';
import type { Task, Workflow } from '../../types/boards.types';
import { IconDelete, IconPlus, IconSettings } from './boards.images';
import { TaskCard } from './TaskCard';
import styles from './column.module.css';
import type { TaskType, Priority } from './Boards';

interface Props {
  id: string;
  workflow: Workflow;
  onAddTask: () => void;
  deleteColumn: () => void;
  renameColumn: (name: string) => Promise<void>;
  canEditWorkflow: boolean;
  draggable?: boolean;
  dragstartHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  dropHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  dragoverHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  taskDragstartHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  setState: {
    setTaskName: React.Dispatch<React.SetStateAction<string>>;
    setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
    setTaskType: React.Dispatch<React.SetStateAction<TaskType>>;
    setPriority: React.Dispatch<React.SetStateAction<Priority>>;
    setAssignee: React.Dispatch<React.SetStateAction<string>>;
    setDueDate: React.Dispatch<React.SetStateAction<string>>;
    setEditModal: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentTaskId: React.Dispatch<React.SetStateAction<string | null>>;
    setTaskId: React.Dispatch<React.SetStateAction<string>>;
    setShowChild: React.Dispatch<React.SetStateAction<boolean>>;
    setShowChildOf: React.Dispatch<React.SetStateAction<Task[] | null>>;
  };
}

export function KanbanColumn({
  id,
  workflow,
  onAddTask,
  deleteColumn,
  renameColumn,
  canEditWorkflow,
  draggable,
  dragstartHandler,
  dropHandler,
  dragoverHandler,
  taskDragstartHandler,
  setState,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(workflow.name);

  async function deleteTask(taskId: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/task/delete/${taskId}`,
        {
          credentials: 'include',
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error("Can't delete task", { cause: response.text });
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      throw new Error('Error deleting task', { cause: err });
    }
  }

  useEffect(() => {
    async function fetchTasks() {
      if (workflow.tasks === undefined || workflow.tasks.length === 0) {
        setTasks([]);
        return;
      }

      const results = await Promise.all(
        workflow.tasks.map(async (id) => {
          const res = await fetch(`http://localhost:3000/api/task/${id}`, {
            credentials: 'include',
          });
          const data = await res.json();
          return data.task;
        }),
      );

      setTasks(results);
    }

    fetchTasks();
  }, [workflow.tasks]);

  useEffect(() => {
    setDraftName(workflow.name);
  }, [workflow.name]);

  useEffect(() => {
    if (!canEditWorkflow && isEditingName) {
      setIsEditingName(false);
    }
  }, [canEditWorkflow, isEditingName]);

  async function handleRenameSubmit(
    event?: SubmitEvent,
  ) {
    event?.preventDefault();
    const nextName = draftName.trim();
    if (nextName === '' || nextName === workflow.name) {
      setIsEditingName(false);
      setDraftName(workflow.name);
      return;
    }
    await renameColumn(nextName);
    setIsEditingName(false);
  }

  return (
    <div
      className={styles.kanbanColumn}
      id={id}
      draggable={draggable}
      onDragStart={dragstartHandler}
      onDragOver={dragoverHandler}
      onDrop={dropHandler}
      data-column={'true'}
    >
      <div className={styles.columnHeader}>
        <div className={styles.columnHeaderLeft}>
          {isEditingName && canEditWorkflow ? (
            <form
              className={styles.columnEditForm}
              onSubmit={handleRenameSubmit}
            >
              <input
                className={styles.columnEditInput}
                type="text"
                aria-label="Column name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                autoFocus
              />
              <div className={styles.columnEditActions}>
                <button
                  className={styles.columnEditBtn}
                  type="submit"
                >
                  Save
                </button>
                <button
                  className={styles.columnEditBtn}
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setDraftName(workflow.name);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <span className={styles.columnTitle}>{workflow.name}</span>
          )}
          {workflow.tasks?.length > 0 && (
            <span className={styles.columnCount}>{tasks.length}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={styles.columnAddBtn}
            onClick={onAddTask}
            title="Add task"
          >
            <IconPlus />
          </button>

          {canEditWorkflow && (
            <>
              <button
                className={styles.columnAddBtn}
                onClick={() => setIsEditingName(true)}
                title="Rename column"
              >
                <IconSettings size={12} />
              </button>

              <button
                className={styles.columnAddBtn}
                onClick={deleteColumn}
                title="Delete column"
              >
                <IconDelete />
              </button>
            </>
          )}
        </div>
      </div>
      <div className={styles.columnBody}>
        {/* <p className={styles.workflowId}>
          {workflow.id}
          <span
            className={styles.copyIcon}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(workflow.id);}}
          >
            <IconCopy />
          </span>
        </p> */}
        {tasks.map((task) => (
          <TaskCard
            deleteTask={deleteTask}
            key={task.id}
            task={task}
            showDelete={true}
            showSettings={true}
            dragstartHandler={taskDragstartHandler}
            draggable={true}
            setState={setState}
          />
        ))}
      </div>
    </div>
  );
}
