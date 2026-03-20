import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import styles from './task.page.module.css';
// import { CommentTest } from "../tests/CommentTest";
import type { Task } from '../../types/boards.types';
import { AuthContext } from '../../context/AuthContext';
import type { CommentDTO, ThreadDTO } from '../../types/comment.types';
import Thread from '../../components/Thread/Thread';
import { TaskTimelineSidebar } from '../../components/Activity/TaskTimelineSidebar';
import AddThreadForm from '../../components/Thread/AddThreadForm';

export default function TaskPage() {
  const { tid } = useParams<{ tid: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [threadTitle, setThreadTitle] = useState<string>('');
  const [threadContent, setThreadContent] = useState<string>('');

  const authContext = useContext(AuthContext);

  const [threads, setThreads] = useState<ThreadDTO[]>([]);

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

        const rawTask = data.task;

        const formattedTask: Task = {
          ...rawTask,
          threads: rawTask.threads.map((thread: any) => ({
            ...thread,
            comments: thread.comments.map((x: CommentDTO) => x.id),
          })),
        };

        setTask(formattedTask);
        setThreads(formattedTask.threads ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (tid) {
      fetchTask();
    }
  }, [tid, refreshKey]);

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
      const newThread = threadData.thread as ThreadDTO;
      setThreads((prev) => [...prev, newThread]);
      setTask((prev) =>
        prev
          ? {
            ...prev,
            threads: [...(prev.threads ?? []), newThread],
          }
          : prev,
      );
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
        {threads &&
          threads.map((thread, idx) => {
            return (
              <Thread 
                refreshTask={() => {
                  setRefreshKey(refreshKey + 1) 
                }} 
                deleteThread={deleteThread} 
                key={idx} 
                thread={thread} 
              />
            );
          })}
        <hr />
        <h1>Have some ideas ? Start a new Thread</h1>
        <AddThreadForm 
          handleThreadSubmit={handleThreadSubmit}
          threadTitle={threadTitle}
          setThreadTitle={setThreadTitle}
          threadContent={threadContent}
          setThreadContent={setThreadContent}
        />
      </div>
      <TaskTimelineSidebar activities={task.activities} />
    </div>
  );
}
