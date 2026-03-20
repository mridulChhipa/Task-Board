import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import styles from './task.page.module.css';
// import { CommentTest } from "../tests/CommentTest";
import type { Task } from '../../types/boards.types';
import Button from '../../components/Button/Button';
import { AuthContext } from '../../context/AuthContext';
import type { CommentDTO, ThreadDTO } from '../../types/comment.types';
import Thread from '../../components/Thread/Thread';
import Form, {
  InputArea,
} from '../../components/Forms/Form';
import { TaskTimelineSidebar } from '../../components/Activity/TaskTimelineSidebar';
import InlineRichTextEditor from '../../components/TextEditor/InlineRichTextEditor';

export default function TaskPage() {
  const { tid } = useParams<{ tid: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [threadTitle, setThreadTitle] = useState<string>('');
  const [threadContent, setThreadContent] = useState<string>('');

  const authContext = useContext(AuthContext);

  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  // const [isOpen, setIsOpen] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await fetch(`http://localhost:3000/api/task/${tid}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch task');
        }

        const data = await res.json();

        // const task: Task = data.task;
        // console.log(task);
        // setTask(task);

        const rawTask = data.task;

        const formattedTask: Task = {
          ...rawTask,
          threads: rawTask.threads.map((thread: any) => ({
            ...thread,
            comments: thread.comments.map((x: CommentDTO) => x.id),
          })),
        };

        // console.log(formattedTask);
        setTask(formattedTask);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (tid) {
      fetchTask();
    }
  }, [tid, threads, refreshKey]);

  if (loading) {
    return <div>Loading task...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  async function handleThreadSubmit(e: SubmitEvent) {
    e.preventDefault();
    try {
      const res = await fetch(
        'http://localhost:3000/api/comment/create-thread',
        {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: task?.id,
            title: threadTitle,
            content: threadContent,
            authorId: authContext.user?.userId,
            isDeleted: false,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Can't create thread at the moment", {
          cause: res.text,
        });
      }

      const threadData = await res.json();
      setThreads([...threads, threadData.thread as ThreadDTO]);
      setThreadContent('');
      setThreadTitle('');
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteThread(id: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comment/delete-thread/${id}`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete Error: ${errorText}`);
      }

      setThreads((threads) => threads.filter((thread) => thread.id !== id));
    } catch (error) {
      throw new Error('Error deleting thread', { cause: error });
    }
  }

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <div className={styles.taskContainer}>
        <h1>{task.title}</h1>
        <p>{task.description}</p>
        {task.threads &&
          task.threads.map((thread, idx) => {
            return (
              <Thread refreshTask={() => { setRefreshKey(refreshKey + 1) }} deleteThread={deleteThread} key={idx} thread={thread} />
            );
          })}
        <hr />
        <h1>Have some ideas ? Start a new Thread</h1>
        <Form onSubmit={handleThreadSubmit}>
          <InputArea>
            <InlineRichTextEditor
              required={true}
              name="title"
              id="title"
              placeholder="Title"
              value={threadTitle}
              rows={1}
              onChange={(e) => setThreadTitle(e.target.value)}
            />
          </InputArea>
          <InputArea>
            <InlineRichTextEditor
              required={true}
              name="desc"
              id="desc"
              placeholder="Description"
              value={threadContent}
              onChange={(e) => setThreadContent(e.target.value)}
            />
          </InputArea>

          <Button type="submit">Start New Thread</Button>
        </Form>
      </div>
      <TaskTimelineSidebar activities={task.activities} />
    </div>
  );
}
