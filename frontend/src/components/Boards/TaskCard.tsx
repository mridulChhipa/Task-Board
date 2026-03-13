import type { Task } from '../../types/boards.types';
import styles from './task.module.css';
import { formatDate, isOverdue } from '../../utils/helpers';
import {
  IconCalendar,
  IconDelete,
  IconUser,
  IconWarning,
} from './boards.images';

interface Props {
  task: Task;
  deleteTask: (id: string) => Promise<void>;
  draggable?: boolean;
  dragstartHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function TaskCard({ task, dragstartHandler, deleteTask }: Props) {
  const overdue =
    typeof task.dueDate !== 'string' ? false : isOverdue(task.dueDate);
  // console.log(task);

  return (
    <div
      className={styles.taskCard}
      draggable={true}
      onDragStart={dragstartHandler}
      data-parent={task.statusId}
      data-id={task.id}
    >
      <div className={styles.taskTop}>
        <span
          className={`${styles.taskTypeBadge} ${styles[`type${task.type}`]}`}
        >
          {task.type}
        </span>
        <span className={styles.taskId}>{task.id}</span>
        <span className={styles.deleteIcon} onClick={() => deleteTask(task.id)}>
          <IconDelete />
        </span>
      </div>

      <div className={styles.taskTitle}>{task.title}</div>

      {task.dueDate && (
        <div
          className={`${styles.taskDue} ${overdue ? styles.taskDueoverdue : styles.taskDueupcoming}`}
        >
          {overdue ? <IconWarning /> : <IconCalendar />}
          {formatDate(task.dueDate)}
        </div>
      )}

      <div className={styles.taskFooter}>
        <span
          className={`${styles.taskpriority} ${styles[`priority${task.priority}`]}`}
        >
          {task.priority}
        </span>
        <div className={styles.taskFooterRight}>
          <div className={styles.taskavatar}>
            {task.assignee ? `#${task.assignee}` : <IconUser size={11} />}
          </div>
        </div>
      </div>
    </div>
  );
}
