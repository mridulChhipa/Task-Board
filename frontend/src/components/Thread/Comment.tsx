import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import type { CommentDTO } from '../../types/comment.types';
import styles from './comment.module.css';
import Button from '../Button/Button';
import { IconDelete } from '../Boards/boards.images';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Modal from '../Modal/Modal';
import Form, { InputArea, Label, TextAreaControl } from '../Forms/Form';

interface Props {
  commentId: string;
  threadId: string;
  deleteHandler: (id: string) => Promise<void>;
}

export function Comment({ commentId, deleteHandler, threadId }: Props) {
  // console.log('Cid: ', commentId);

  const [comment, setComment] = useState<CommentDTO>();
  const [replies, setReplies] = useState<string[]>([]);
  const [reply, setReply] = useState('');
  const [replyModal, setReplyModal] = useState(false);

  const { tid: taskId } = useParams();
  const authContext = useContext(AuthContext);

  async function fetchComment(cid: string) {
    try {
      const res = await fetch(`http://localhost:3000/api/comment/t/${cid}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Can't create thread at the moment", {
          cause: errorText,
        });
      }

      const data = await res.json();
      // console.log("Comment Data: ", data);
      setComment(data.comment);
      setReplies([...replies, data.comment.replies ?? []]);
    } catch (err) {
      throw new Error("Can't fetch comment", { cause: err });
    }
  }

  async function deleteReply(id: string) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/comment/delete-comment/${id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threadId: '', // need to put it here
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Delete Error: ${errorText}`);
      }

      setReplies((prev) => prev.filter((c: string) => c !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  async function handleReplySubmit(e: SubmitEvent) {
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
            authorId: authContext?.user?.userId,
            content: reply,
            isDeleted: false,
            parentId: commentId,
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

      setReplies([...replies, data.comment.id]);
      setReply('');
      setReplyModal(false);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchComment(commentId);
  }, [replies]);

  if (!comment || comment.isDeleted) return <></>;

  // console.log("Comment: ", comment);
  return (
    <>
      {replyModal && (
        <Modal onclick={() => setReplyModal(false)}>
          <Form onSubmit={handleReplySubmit}>
            <InputArea>
              <Label htmlFor="name">Task Name</Label>
              <TextAreaControl
                placeholder="e.g. Create QGraphicsScene"
                name="reply"
                id="reply"
                onChange={(e) => setReply(e.target.value)}
                required
                value={reply}
              />
            </InputArea>

            <div className={styles.buttonGroup}>
              <Button
                priority="second"
                type="button"
                onClick={() => setReplyModal(false)}
              >
                Cancel
              </Button>
              <Button priority="first" type="submit">
                Post Reply
              </Button>
            </div>
          </Form>
        </Modal>
      )}
      <div className={styles.commentWrapper}>
        <div className={styles.meta}>
          <div>
            <strong>User {comment.authorId}</strong>
            <span>
              | Created: {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            <span>
              | Updated: {new Date(comment.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <span
            className={styles.deleteIcon}
            onClick={() => {
              deleteHandler(comment.id);
            }}
          >
            <IconDelete />
          </span>
        </div>

        <div style={{ fontSize: '0.85em', color: '#666' }}>
          Parent ID: {comment.parentId ? comment.parentId : 'None'}
        </div>

        <div className={styles.content}>{comment.content}</div>
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          <Button size="mini" onClick={() => setReplyModal(true)}>
            Reply
          </Button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className={styles.repliesList}>
            {comment.replies.map((replyId) => (
              <Comment
                key={replyId}
                commentId={replyId}
                threadId={threadId}
                deleteHandler={deleteReply}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
