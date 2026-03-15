import type { Prisma } from '../../generated/prisma/client';
import { db } from '../config/db';
import { ThreadDTO } from '../types/comment.types';
import type { PriorityType, TaskDTO, TaskType } from '../types/task.types';

type TaskWithChildren = Prisma.TaskGetPayload<{
  include: { children: true; threads: true };
}>;

type PrismaTask = Prisma.TaskGetPayload<Record<string, never>>;

export function toTaskDTO(task: TaskWithChildren): TaskDTO {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type as TaskType,
    priority: task.priority as PriorityType,
    assignee: task.assignee,
    reporter: task.reporter,
    dueDate: task.dueDate,
    // stackPosition: task.stackPosition,
    statusId: task.statusId,
    parentId: task.parentId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    resolvedAt: task.resolvedAt,
    closedAt: task.closedAt,
    threads: task.threads?.map((thread) => {
      return thread as ThreadDTO;
    }),
    children: task.children?.map((child) => {
      return child.id;
    }),
  };
}

// Lock the Story: Start a transaction and lock the specific Story row.
// Fetch Siblings: Fetch the statuses of all Tasks/Bugs linked to that Story.
export async function syncStatusWithChildren(storyId: string): Promise<void> {
  try {
    const story = await db.task.findUnique({
      where: {
        id: storyId,
      },
      include: {
        children: {
          include: {
            status: true,
          },
        },
        status: true,
      },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    let newStatusIdx = 1000000;
    let newStatusId = story.status.id;
    for (const childTask of story.children) {
      if (childTask.status.orderIdx < newStatusIdx) {
        newStatusIdx = childTask.status.orderIdx;
        newStatusId = childTask.status.id;
      }
    }

    await db.task.update({
      where: {
        id: story.id,
      },
      data: {
        statusId: newStatusId,
      },
    });

    if (story.parentId) {
      syncStatusWithChildren(story.parentId);
    }
  } catch (error) {
    throw new Error('Error syncing status: ', { cause: error });
  }
}
