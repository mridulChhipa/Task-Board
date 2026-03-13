import { useEffect, useState } from 'react';
import type { Task, Workflow } from '../../types/boards.types';
import { IconPlus } from './boards.images';
import { TaskCard } from './TaskCard';
import styles from './column.module.css';

interface Props {
  id: string;
  workflow: Workflow;
  onAddTask: () => void;
  draggable?: boolean;
  dragstartHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  dropHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  dragoverHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  taskDragstartHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
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
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);

  // console.log(workflow);

  useEffect(() => {
    async function fetchTasks() {
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

    if (workflow.tasks?.length) {
      fetchTasks();
    }
  }, [workflow.tasks]);

  // console.log(workflow.id,tasks);
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
            <span className={styles.columnCount}>{workflow.tasks.length}</span>
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
        {tasks.map((task, idx) => (
          <TaskCard key={idx} task={task} dragstartHandler={taskDragstartHandler} draggable={true}/>
        ))}
      </div>
    </div>
  );
}
