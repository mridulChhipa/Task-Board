import type { CommentDTO, ThreadDTO } from '../../types/comment.types';
import { Comment } from './Comment';
import styles from './thread.module.css';

interface Props {
  thread: ThreadDTO;
  allComments: Record<string, CommentDTO>;
}

export default function Thread({ thread, allComments }: Props) {
  if (thread.isDeleted) return <div>This thread has been removed.</div>;

  return (
    <div className={styles.threadContainer}>
      <h2>{thread.title}</h2>
      <div className={styles.meta}>
        Posted by User {thread.authorId} on {new Date(thread.createdAt).toDateString()}
      </div>
      <div className={styles.content}>
        {thread.content}
      </div>

      <section className={styles.commentSection}>
        <h3>Comments ({thread.comments.length})</h3>
        {thread.comments.map((commentId) => (
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