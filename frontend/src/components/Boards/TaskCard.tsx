import type { Task } from '../../types/boards.types';
import styles from './task.module.css';
import { formatDate, isOverdue } from '../../utils/helpers';
import {
  IconCalendar,
  IconDelete,
  IconUser,
  IconWarning,
} from './boards.images';
import { useNavigate } from 'react-router-dom';
import IconSettings from '../../assets/settingsIcon.svg';

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
  const navigate = useNavigate();

  return (
    <>
      <div
        className={styles.taskCard}
        draggable={true}
        onDragStart={dragstartHandler}
        data-parent={task.statusId}
        data-id={task.id}
        onClick={() => {
          navigate(`task/${task.id}`);
        }}
      >
        <div className={styles.taskTop}>
          <span
            className={`${styles.taskTypeBadge} ${styles[`type${task.type}`]}`}
          >
            {task.type}
          </span>
          <span className={styles.taskId}>{task.id}</span>
          <span className={styles.deleteIcon} onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}>
            <IconDelete />
          </span>
          <span className={styles.settingsIcon}>
            <img src={IconSettings} alt="Settings" onClick={(e) => {
              e.stopPropagation();
            }} style={{height:'13px'}}/>
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
    </>
  );
}
