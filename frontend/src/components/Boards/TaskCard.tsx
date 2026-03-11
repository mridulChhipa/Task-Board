import type { Task } from '../../types/boards.types';
import styles from './task.module.css';
import { formatDate, isOverdue } from '../../utils/helpers';
import { IconCalendar, IconUser, IconWarning } from './boards.images';

interface Props {
  task: Task;
}

export function TaskCard({ task }: Props) {
  const overdue =
    typeof task.dueDate !== 'string' ? false : isOverdue(task.dueDate);
  // console.log(task);

  return (
    <div className={styles.taskCard}>
      <div className={styles.taskTop}>
        <span
          className={`${styles.taskTypeBadge} ${styles[`type${task.type}`]}`}
        >
          {' '}
          {task.type}
        </span>
        <span className={styles.taskId}>{task.id}</span>
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
          {' '}
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
