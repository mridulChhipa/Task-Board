import type { CommentDTO } from '../../types/comment.types';
import styles from './comment.module.css';

interface Props {
  commentId: string;
  allComments: Record<string, CommentDTO>; // Lookup map for O(1) access
}

export function Comment({ commentId, allComments }: Props) {
  const comment = allComments[commentId];

  if (!comment || comment.isDeleted) return null;

  return (
    <div className={styles.commentWrapper}>
      <div className={styles.meta}>
        <strong>User {comment.authorId}</strong>
        {new Date(comment.createdAt).toLocaleDateString()}
      </div>
      <div className={styles.content}>{comment.content}</div>

      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.repliesList}>
          {comment.replies.map((replyId) => (
            <Comment
              key={replyId}
              commentId={replyId}
              allComments={allComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
