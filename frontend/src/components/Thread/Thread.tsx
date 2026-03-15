import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import type { ThreadDTO } from '../../types/comment.types';
import { IconDelete } from '../Boards/boards.images';
import Button from '../Button/Button';
import Form, { InputArea, TextAreaControl } from '../Forms/Form';
import { Comment } from './Comment';
import styles from './thread.module.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface Props {
  thread: ThreadDTO;
  deleteThread: (id: string) => Promise<void>;
}

export default function Thread({ thread, deleteThread }: Props) {
  if (thread.isDeleted) return <></>;

  const [comment, setComment] = useState<string>();
  const [comments, setComments] = useState<string[]>(thread.comments ?? []);

  const { tid: taskId } = useParams();
  const authContext = useContext(AuthContext);

  async function handleCommentSubmit(e: SubmitEvent) {
    e.preventDefault();
    try {
      const res = await fetch(
        'http://localhost:3000/api/comment/create-comment',
        {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId,
            threadId: thread.id,
            authorId: authContext?.user?.userId,
            content: comment,
            isDeleted: false,
            parentId: null,
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Can't create thread at the moment", {
          cause: errorText,
        });
      }

      const data = await res.json();

      setComments([...comments, data.comment.id]);
      setComment('');
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteComment(id: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/delete-comment/${id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threadId: thread.id,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete Error: ${errorText}`);
      }

      setComments((prevComments) =>
        prevComments.filter((c: string) => c !== id),
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  useEffect(() => {}, [handleCommentSubmit, comments]);

  // console.log("Thread: ", thread);

  return (
    <div className={styles.threadContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{thread.title}</h2>
        <span
          className={styles.deleteIcon}
          onClick={() => deleteThread(thread.id)}
        >
          <IconDelete />
        </span>
      </div>
      <div className={styles.meta}>
        Posted by User {thread.authorId} on{' '}
        {new Date(thread.createdAt).toDateString()}
      </div>
      <div className={styles.content}>{thread.content}</div>

      <section className={styles.commentSection}>
        <h3>Comments ({comments.length})</h3>
        {comments.map((comment, idx) => (
          <Comment
            key={idx}
            threadId={thread.id}
            commentId={comment}
            deleteHandler={() => deleteComment(comment)}
          />
        ))}
      </section>

      <Form onSubmit={handleCommentSubmit}>
        <InputArea>
          <TextAreaControl
            required={true}
            name="desc"
            id="desc"
            placeholder="Description"
            value={comment ?? ''}
            onChange={(e) => setComment(e.target.value)}
          />
        </InputArea>

        <Button type="submit">Post Comment</Button>
      </Form>
    </div>
  );
}
