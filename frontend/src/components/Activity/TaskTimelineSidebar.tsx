import React from 'react';
import styles from './TaskTimelineSidebar.module.css';
import type { ActivityDTO } from '../../types/boards.types';

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
  const author = 'Someone';

  switch (type) {
    case 'TASK_STATUS_UPDATED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{author}</span> changed status from{' '}
          <span className={styles.statusOld}>
            {metadata.oldStatusId || 'None'}
          </span>{' '}
          to <span className={styles.statusNew}>{metadata.newStatusId}</span>
        </p>
      );

    case 'TASK_ASSIGNEE_CHANGED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{author}</span> assigned task to User
          #{metadata.newAssignee}
        </p>
      );

    case 'COMMENT_ADDED':
      return (
        <div className={styles.commentBox}>
          <p className={styles.activityText}>
            <span className={styles.author}>{author}</span> added a comment:
          </p>
          <p className={styles.commentQuote}>
            "Reference comment #{metadata.commentId}"
          </p>
        </div>
      );

    case 'COMMENT_EDITED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{author}</span> edited comment #
          {metadata.commentId}
        </p>
      );

    case 'COMMENT_DELETED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{author}</span> deleted a comment
        </p>
      );

    case 'THREAD_ADDED':
      return (
        <div className={styles.commentBox}>
          <p className={styles.activityText}>
            <span className={styles.author}>{author}</span> started a new
            thread:
          </p>
          <p className={styles.commentQuote}>
            "Reference thread #{metadata.threadId}"
          </p>
        </div>
      );

    case 'THREAD_EDITED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{author}</span> edited thread #
          {metadata.threadId}
        </p>
      );

    case 'THREAD_DELETED':
      return (
        <p className={styles.activityText}>
          <span className={styles.author}>{author}</span> deleted a thread
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
          <button className={styles.closeButton}>✕</button>
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
