import {
  useContext,
  useState,
  type KeyboardEvent,
  type SubmitEvent,
} from 'react';
import type { ThreadDTO } from '../../types/comment.types';
import { IconDelete } from '../Boards/boards.images';
import Button from '../Button/Button';
import Form, { InputArea } from '../Form/Form';
import { Comment } from './Comment';
import styles from './thread.module.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import InlineRichTextEditor from '../TextEditor/InlineRichTextEditor';
import { sanitizeHtml } from '../../utils/sanitizer';

interface Props {
  thread: ThreadDTO;
  deleteThread: (id: string) => Promise<void>;
  refreshTask: () => void;
}

export default function Thread({ thread, deleteThread, refreshTask }: Props) {
  const { tid: taskId } = useParams();
  const authContext = useContext(AuthContext);

  const [comment, setComment] = useState<string>();
  const [comments, setComments] = useState<string[]>(thread.comments ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<'title' | 'content' | null>(
    null,
  );
  const [editedTitle, setEditedTitle] = useState(thread.title);
  const [editedContent, setEditedContent] = useState<string>(
    thread.content ?? '',
  );

  const handleSave = async () => {
    const hasTitleChange = editedTitle !== thread.title && editedTitle !== '';
    const hasContentChange = (editedContent ?? '') !== (thread.content ?? '');

    if (hasTitleChange || hasContentChange) {
      try {
        const res = await fetch(
          `http://localhost:3000/api/comment/update-thread/${thread.id}`,
          {
            credentials: 'include',
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskId,
              title: editedTitle,
              content: editedContent,
              isDeleted: false,
            }),
          },
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error("Can't save thread updates at the moment", {
            cause: errorText,
          });
        }

        console.log('Saving thread updates:', {
          title: editedTitle,
          content: editedContent,
        });
      } catch (error) {
        console.error('Failed to update thread', error);
        setEditedTitle(thread.title);
        setEditedContent(thread.content ?? '');
      }
    }

    setIsEditing(false);
    setEditingField(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(thread.title);
      setEditedContent(thread.content ?? '');
      setIsEditing(false);
      setEditingField(null);
    }
  };

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
        throw new Error("Can't create comment at the moment", {
          cause: errorText,
        });
      }

      const data = await res.json();

      setComments([...comments, data.comment.id]);
      setComment('');
      refreshTask();
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

  if (thread.isDeleted) {
    return <></>;
  }

  return (
    <div className={styles.threadContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {isEditing && editingField === 'title' ? (
          <InlineRichTextEditor
            value={editedTitle}
            onChange={(e) => {
              setEditedTitle(e.target.value);
            }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h2
            onClick={() => {
              setIsEditing(true);
              setEditingField('title');
            }}
            style={{ cursor: 'text', flexGrow: 1, margin: 0 }}
            title="Click to edit"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(editedTitle) }}
          />
        )}
        <span
          className={styles.deleteIcon}
          onClick={() => deleteThread(thread.id)}
        >
          <IconDelete />
        </span>
      </div>
      <div className={styles.meta}>
        Posted by User {thread.authorName} on
        {new Date(thread.createdAt).toDateString()}
      </div>
      <div className={styles.content}>
        {isEditing && editingField === 'content' ? (
          <InlineRichTextEditor
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            rows={4}
          />
        ) : (
          <p
            onClick={() => {
              setIsEditing(true);
              setEditingField('content');
            }}
            style={{ cursor: 'text', flexGrow: 1, margin: 0 }}
            title="Click to edit"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(editedContent) }}
          />
        )}
      </div>

      <section className={styles.commentSection}>
        <h3>Comments ({comments.length})</h3>
        {comments.map((comment, idx) => (
          <Comment
            refreshTask={refreshTask}
            key={idx}
            threadId={thread.id}
            commentId={comment}
            deleteHandler={() => deleteComment(comment)}
          />
        ))}
      </section>

      <Form onSubmit={handleCommentSubmit}>
        <InputArea>
          <InlineRichTextEditor
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
