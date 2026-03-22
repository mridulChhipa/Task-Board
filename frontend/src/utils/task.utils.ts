import type { LoaderFunctionArgs } from 'react-router-dom';
import type { Task } from '../types/boards.types';

export async function taskLoader({
  params,
}: LoaderFunctionArgs): Promise<Task> {
  const tid = params.tid;

  if (!tid) {
    throw new Error('Not Found');
  }

  const res = await fetch(`http://localhost:3000/api/task/${tid}`);

  if (!res.ok) {
    throw new Error('Failed to fetch task', { cause: res.status });
  }

  const data = await res.json();
  const task: Task = data.task;
  return task;
}
