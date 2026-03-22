import {
  useContext,
  useEffect,
  useState,
  useCallback,
  type KeyboardEvent,
  type SubmitEvent,
} from 'react';
import type { CommentDTO } from '../../types/comment.types';
import styles from './comment.module.css';
import Button from '../Button/Button';
import { IconDelete } from '../Boards/boards.images';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Modal from '../Modal/Modal';
import Form, { InputArea, Label } from '../Form/Form';
import InlineRichTextEditor from '../TextEditor/InlineRichTextEditor';
import { sanitizeHtml, highlightEmails } from '../../utils/sanitizer';

interface Props {
  commentId: string;
  threadId: string;
  deleteHandler: (id: string) => Promise<void>;
  refreshTask: () => void;
}

export function Comment({
  commentId,
  deleteHandler,
  threadId,
  refreshTask,
}: Props) {
  // console.log('Cid: ', commentId);

  const [comment, setComment] = useState<CommentDTO>();
  const [replies, setReplies] = useState<string[]>([]);
  const [reply, setReply] = useState('');
  const [replyModal, setReplyModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const { tid: taskId } = useParams();
  const authContext = useContext(AuthContext);

  const fetchComment = useCallback(
    async (cid: string) => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/comment/t/${cid}?threadId=${encodeURIComponent(threadId)}`,
          {
            credentials: 'include',
          },
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error("Can't fetch comment at the moment", {
            cause: errorText,
          });
        }

        const data = await res.json();
        // console.log("Comment Data: ", data);
        setComment(data.comment);
        if (!isEditing) {
          setEditedContent(data.comment.content ?? '');
        }
        const nextReplies = data.comment.replies ?? [];
        setReplies(nextReplies);
        setComment((prev) =>
          prev ? { ...prev, replies: nextReplies } : data.comment,
        );
      } catch (err) {
        throw new Error("Can't fetch comment", { cause: err });
      }
    },
    [isEditing, threadId],
  );

  const handleSave = async () => {
    if (!comment) {
      return;
    }
    const hasContentChange = editedContent !== (comment.content ?? '');

    console.log('Saving comment updates:', {
      content: editedContent,
      commentId: comment.id,
    });
    if (hasContentChange) {
      try {
        const res = await fetch(
          `http://localhost:3000/api/comment/update-comment/${comment.id}`,
          {
            credentials: 'include',
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskId,
              threadId,
              content: editedContent,
              isDeleted: false,
            }),
          },
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error("Can't update comment at the moment", {
            cause: errorText,
          });
        }

        setComment({ ...comment, content: editedContent });
      } catch (error) {
        console.error('Failed to update comment', error);
        setEditedContent(comment.content ?? '');
      }
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedContent(comment?.content ?? '');
      setIsEditing(false);
    }
  };

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
            threadId,
            authorId: authContext?.user?.userId,
            content: reply,
            isDeleted: false,
            parentId: commentId,
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Can't reply at the moment", {
          cause: errorText,
        });
      }

      const data = await res.json();

      setReplies([...replies, data.comment.id]);
      setReply('');
      setReplyModal(false);
      refreshTask();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchComment(commentId);
  }, [commentId, fetchComment]);

  if (!comment || comment.isDeleted) {
    return <></>;
  }

  return (
    <>
      {replyModal && (
        <Modal onclick={() => setReplyModal(false)}>
          <Form onSubmit={handleReplySubmit}>
            <InputArea>
              <Label htmlFor="reply">Your Reply</Label>
              <InlineRichTextEditor
                id="reply"
                name="reply"
                placeholder="Type your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
              />
            </InputArea>

            <div className={styles.buttonGroup}>
              <Button
                priority="second"
                type="button"
                onClick={() => {
                  setReplyModal(false);
                  setReply(''); // Clear the editor if the user cancels
                }}
              >
                Cancel
              </Button>

              <Button
                priority="first"
                type="submit"
                disabled={!reply.trim() || reply === '<p><br></p>'}
              >
                Post Reply
              </Button>
            </div>
          </Form>
        </Modal>
      )}
      <div className={styles.commentWrapper}>
        <div className={styles.meta}>
          <div>
            <strong>User {comment.authorName}</strong>
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

        <div className={styles.content}>
          {isEditing ? (
            <InlineRichTextEditor
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              rows={4}
            />
          ) : (
            <p
              onClick={() => setIsEditing(true)}
              style={{ cursor: 'text', margin: 0 }}
              title="Click to edit"
              dangerouslySetInnerHTML={{
                __html: highlightEmails(sanitizeHtml(comment.content)),
              }}
            ></p>
          )}
        </div>
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          <Button size="mini" onClick={() => setReplyModal(true)}>
            Reply
          </Button>
        </div>
        {replies.length > 0 && (
          <div className={styles.repliesList}>
            {replies.map((replyId) => (
              <Comment
                key={replyId}
                refreshTask={refreshTask}
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
