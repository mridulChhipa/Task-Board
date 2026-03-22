import type { Task } from '../../types/boards.types';
import styles from './task.module.css';
import { formatDate, isOverdue } from '../../utils/helpers';
import {
  IconCalendar,
  IconDelete,
  IconSettings,
  IconUser,
  IconWarning,
  IconCopy,
} from './boards.images';
import { type Priority, type TaskType } from '../../types/boards.types';
import { useNavigate } from 'react-router-dom';

interface Props {
  task: Task;
  deleteTask?: (id: string) => Promise<void>;
  draggable?: boolean;
  dragstartHandler?: (event: React.DragEvent<HTMLDivElement>) => void;
  showDelete: boolean;
  showSettings: boolean;
  setState?: {
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

async function getMailfromId(id: number): Promise<string> {
  try {
    const res = await fetch(`http://localhost:3000/api/auth/${id}`, {
      credentials: 'include',
    });
    const data = await res.json();
    const email = data.data.personalData.email;
    return email;
  } catch (err) {
    console.error('Error fetching user data', err);
    return '';
  }
}

async function childrenOf(task: Task | null): Promise<Task[]> {
  if (!task) {
    return [];
  }
  const children = await Promise.all(
    task.children.map(async (child: string) => {
      const res = await fetch(`http://localhost:3000/api/task/${child}`, {
        credentials: 'include',
      });
      const data = await res.json();
      return data.task as Task;
    }),
  );
  return children;
}

export function TaskCard({
  task,
  draggable,
  dragstartHandler,
  deleteTask,
  showDelete,
  showSettings,
  setState,
}: Props) {
  const overdue =
    typeof task.dueDate !== 'string' ? false : isOverdue(task.dueDate);
  // console.log(task);
  const navigate = useNavigate();

  return (
    <div
      className={styles.taskCard}
      draggable={draggable}
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '5px',
              justifyContent: 'flex-end',
            }}
          >
            {task.type === 'STORY' && (
              <span
                className={styles.copyIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setState?.setTaskId(task.id);
                }}
              >
                <IconCopy />
              </span>
            )}
            {showDelete && (
              <span
                className={styles.deleteIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask?.(task.id);
                }}
              >
                <IconDelete />
              </span>
            )}
            {showSettings && (
              <span
                className={styles.settingsIcon}
                onClick={async (e) => {
                  e.stopPropagation();
                  setState?.setTaskName(task.title);
                  setState?.setTaskDescription(task.description ?? '');
                  setState?.setTaskType(task.type);
                  setState?.setPriority(task.priority);
                  setState?.setAssignee(await getMailfromId(task.assignee));
                  setState?.setDueDate(
                    task.dueDate
                      ? new Date(task.dueDate).toISOString().slice(0, 10)
                      : '',
                  );
                  setState?.setCurrentTaskId(task.id);
                  setState?.setEditModal(true);
                }}
              >
                <IconSettings />
              </span>
            )}
          </div>
          {task.type === 'STORY' && (
            <button
              className={styles.childButton}
              onClick={async (e) => {
                e.stopPropagation();
                setState?.setShowChild(true);
                const taskWithChildren = await childrenOf(task);
                setState?.setShowChildOf(taskWithChildren);
              }}
            >
              Children
            </button>
          )}
        </div>
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
