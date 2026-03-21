import React from 'react';
import styles from './TaskTimelineSidebar.module.css';
import type { ActivityDTO } from '../../types/boards.types';
import { sanitizeHtml } from '../../utils/sanitizer';

interface TaskTimelineSidebarProps {
  activities?: ActivityDTO[];
  // isOpen: boolean;
  // onClose: () => void;
}

const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const ActivityContent: React.FC<{ activity: ActivityDTO }> = ({ activity }) => {
  const { type, metadata } = activity;

  switch (type) {
    case 'TASK_STATUS_UPDATED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{metadata.user?.name}</span>{' '}
          changed status from
          <span className={styles.statusOld}>
            {metadata.oldStatus?.name || 'None'}
          </span>
          to
          <span className={styles.statusNew}>{metadata.newStatus?.name}</span>
        </p>
      );

    case 'TASK_ASSIGNEE_CHANGED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{metadata.user?.name}</span>{' '}
          assigned task to User #{metadata.newAssignee?.name}
        </p>
      );

    case 'COMMENT_ADDED':
      return (
        <div className={styles.commentBox}>
          <span className={styles.activityText}>
            <span className={styles.author}>
              {metadata.user?.name}
            </span>{' '}
            added a comment:&nbsp;
          </span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(`"${metadata.comment?.content}"`) }} className={styles.commentQuote} />
        </div>
      );

    case 'COMMENT_EDITED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{metadata.user?.name}</span>{' '}
          edited comment #{metadata.comment?.content}
        </p>
      );

    case 'COMMENT_DELETED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{metadata.user?.name}</span>{' '}
          deleted a comment
        </p>
      );

    case 'THREAD_ADDED':
      return (
        <div className={styles.commentBox}>
          <span className={styles.activityText}>
            <span className={styles.author}>
              {metadata.user?.name}
            </span>
            started a new thread:
          </span>
          <span dangerouslySetInnerHTML={{__html: sanitizeHtml(`"#${metadata.thread?.title}"`)}} className={styles.commentQuote} />
        </div>
      );

    case 'THREAD_EDITED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{metadata.user?.name}</span>{' '}
          edited thread #{metadata.thread?.title}
        </p>
      );

    case 'THREAD_DELETED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{metadata.user?.name}</span>{' '}
          deleted a thread
        </p>
      );

    default:
      return <p className={styles.unknownActivity}>Unknown activity</p>;
  }
};

export const TaskTimelineSidebar = ({
  activities = [],
}: TaskTimelineSidebarProps) => {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2 className={styles.title}>Activity</h2>
        </div>

        <div className={styles.content}>
          {sortedActivities.length === 0 ? (
            <p className={styles.emptyState}>No activity recorded yet.</p>
          ) : (
            <div className={styles.timeline}>
              {sortedActivities.map((activity) => (
                <div key={activity.id} className={styles.timelineItem}>
                  <span className={styles.timelineDot} />
                  <div className={styles.itemContent}>
                    <span className={styles.timestamp}>
                      {formatTimestamp(activity.timestamp)}
                    </span>
                    <ActivityContent activity={activity} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
