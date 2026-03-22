import type { Prisma } from '../../generated/prisma/client';
import { db } from '../config/db';
import type { UserDetails } from '../types/auth.types';
import type { ColumnDTO } from '../types/board.types';
import type { CommentDTO, ThreadDTO } from '../types/comment.types';
import type {
  ActivityDTO,
  ActivityType,
  PriorityType,
  TaskDTO,
  TaskType,
} from '../types/task.types';
import { toThreadDTO } from './comment.utils';

type TaskWithChildren = Prisma.TaskGetPayload<{
  include: {
    children: true;
    threads: {
      include: {
        author: true;
        comments: true;
      }
    };
    activities: {
      include: {
        newAssignee: true;
        oldAssignee: true;
        oldStatus: true;
        newStatus: true;
        user: true;
        comment: true;
        thread: true;
      };
    };
  };
}>;

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
    statusId: task.statusId,
    parentId: task.parentId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    resolvedAt: task.resolvedAt,
    closedAt: task.closedAt,
    threads: task.threads?.map((thread) => {
      // return toThreadDTO(thread as any);
      return {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        taskId: thread.taskId,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        isDeleted: thread.isDeleted,
        authorId: thread.authorId,
        comments: thread.comments?.map((comment) => comment.id) ?? [],
        authorName: thread.author.name,
      } as ThreadDTO
    }),
    children: task.children?.map((child) => {
      return child.id;
    }),
    activities: task.activities.map(
      (activity): ActivityDTO => ({
        id: activity.id,
        type: activity.type as ActivityType,
        timestamp: activity.timestamp.toISOString(),
        metadata: {
          thread: activity.thread as ThreadDTO,
          comment: activity.comment as CommentDTO,
          oldStatus: activity.oldStatus as ColumnDTO,
          newStatus: activity.newStatus as ColumnDTO,
          oldAssignee: (activity.oldAssignee
            ? {
              ...activity.oldAssignee,
              userId: activity.oldAssignee.id,
            }
            : null) as UserDetails,
          newAssignee: (activity.newAssignee
            ? {
              ...activity.newAssignee,
              userId: activity.newAssignee.id,
            }
            : null) as UserDetails,
          user: (activity.user
            ? {
              ...activity.user,
              userId: activity.user.id,
            }
            : null) as UserDetails,
        },
      }),
    ),
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
