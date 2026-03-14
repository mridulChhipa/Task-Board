import type { CommentDTO } from '../../types/comment.types';
import styles from './comment.module.css';

interface Props {
  commentId: string;
  deleteHandler: (id: string) => Promise<void>
}

export function Comment({ commentId, deleteHandler }: Props) {

  return <h1>{commentId}</h1>

  // if (!comment || comment.isDeleted) return null;

  // return (
  //   <div className={styles.commentWrapper}>
  //     <div className={styles.meta}>
  //       <strong>User {comment.authorId}</strong>
  //       {new Date(comment.createdAt).toLocaleDateString()}
  //     </div>
  //     <div className={styles.content}>{comment.content}</div>

  //     {comment.replies && comment.replies.length > 0 && (
  //       <div className={styles.repliesList}>
  //         {comment.replies.map((replyId) => (
  //           <Comment
  //             key={replyId}
  //             commentId={replyId}
  //             allComments={allComments}
  //             deleteHandler={deleteHandler}
  //           />
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );
}
