import { useEffect, useState } from 'react';
import type { Task, Workflow } from '../../types/boards.types';
import { IconPlus } from './boards.images';
import { TaskCard } from './TaskCard';
import styles from './column.module.css';
import type { TaskType, Priority } from './Boards';

interface Props {
  id: string;
  workflow: Workflow;
  onAddTask: () => void;
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
  };
}

export function KanbanColumn({
  id,
  workflow,
  onAddTask,
  draggable,
  dragstartHandler,
  dropHandler,
  dragoverHandler,
  taskDragstartHandler,
  setState,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);

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
      if (workflow.tasks.length === 0) {
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
          <span className={styles.columnTitle}>{workflow.name}</span>
          {workflow.tasks?.length > 0 && (
            <span className={styles.columnCount}>{tasks.length}</span>
          )}
        </div>
        <button
          className={styles.columnAddBtn}
          onClick={onAddTask}
          title="Add task"
        >
          <IconPlus />
        </button>
      </div>
      <div className={styles.columnBody}>
        {/* {workflow.id} */}
        {tasks.map((task) => (
          <TaskCard
            deleteTask={deleteTask}
            key={task.id}
            task={task}
            dragstartHandler={taskDragstartHandler}
            draggable={true}
            setState={setState}
          />
        ))}
      </div>
    </div>
  );
}
