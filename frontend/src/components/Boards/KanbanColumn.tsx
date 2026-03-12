import { useEffect, useState } from 'react';
import type { Task, Workflow } from '../../types/boards.types';
import { IconPlus } from './boards.images';
import { TaskCard } from './TaskCard';
import styles from './column.module.css';

interface Props {
  id: string;
  workflow: Workflow;
  onAddTask?: () => void;
  draggable?: boolean;
  dragstartHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  dropHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  dragoverHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function KanbanColumn({ id, workflow, onAddTask, draggable, dragstartHandler, dropHandler, dragoverHandler }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      const results = await Promise.all(
        workflow.tasks.map((id) =>
          fetch(`http://localhost:3000/api/task/${id}`, {
            credentials: 'include',
          })
            .then((res) => res.json())
            .then((resJson) => resJson.task),
        ),
      );

      setTasks(results);
    }

    if (workflow.tasks?.length) {
      fetchTasks();
    }
  }, [workflow.tasks]);

  // console.log(workflow.id,tasks);
  return (
    <div className={styles.kanbanColumn} id={id} draggable={draggable} onDragStart={dragstartHandler} onDrop={dropHandler} onDragOver={dragoverHandler}>
      <div className={styles.columnHeader}>
        <div className={styles.columnHeaderLeft}>
          <span className={styles.columnTitle}>{workflow.name}</span>
          {workflow.tasks.length > 0 && (
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
          <TaskCard key={idx} task={task} />
        ))}
      </div>
    </div>
  );
}
