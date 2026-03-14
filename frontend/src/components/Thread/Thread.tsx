import type { CommentDTO, ThreadDTO } from '../../types/comment.types';
import { IconDelete } from '../Boards/boards.images';
import { Comment } from './Comment';
import styles from './thread.module.css';

interface Props {
  thread: ThreadDTO;
  allComments: Record<string, CommentDTO>;
  deleteThread: (id: string) => Promise<void>,
}

export default function Thread({ thread, allComments, deleteThread }: Props) {
  // if (thread.isDeleted) return <div>This thread has been removed.</div>;
  if (thread.isDeleted) return <></>;

  return (
    <div className={styles.threadContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{thread.title}</h2>
        <span className={styles.deleteIcon} onClick={() => deleteThread(thread.id)}>
          <IconDelete />
        </span>
      </div>
      <div className={styles.meta}>
        Posted by User {thread.authorId} on {new Date(thread.createdAt).toDateString()}
      </div>
      <div className={styles.content}>
        {thread.content}
      </div>

      <section className={styles.commentSection}>
        <h3>Comments ({thread.comments ?? [].length})</h3>
        {thread.comments?.map((commentId) => (
          <Comment
            key={commentId}
            commentId={commentId}
            allComments={allComments}
          />
        ))}
      </section>
    </div>
  );
};