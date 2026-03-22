import { db } from '../config/db';
import { syncStatusWithChildren, toTaskDTO } from '../utils/task.utils';
import type { Priority, TaskType } from '../../generated/prisma/enums';
import type { CreateTaskBody, TaskDTO } from '../types/task.types';
import { notificationService } from './notification.service';
import { NotifType } from '../types/notifcation.types';
import { sendNotif } from '../websocket/ws.service';

export class TaskService {
  async create({
    title,
    description,
    type,
    priority,
    assignee,
    reporter,
    dueDate,
    statusId,
    parentId,
  }: CreateTaskBody): Promise<string> {
    try {
      const createdTask = await db.task.create({
        data: {
          title,
          description,
          type: type as TaskType,
          priority: priority as Priority,
          assignee,
          reporter,
          dueDate: dueDate,
          statusId,
          parentId,
        },
      });

      await notificationService.createNotification({
        recipientId: assignee,
        senderId: reporter,
        taskId: createdTask.id,
        commentId: null,
        threadId: null,
        type: NotifType.TASK_ASSIGNED,
      });

      sendNotif(
        reporter,
        assignee,
        `You have been assigned a new task: ${title}`,
      );

      if (parentId) {
        await syncStatusWithChildren(parentId);
      }

      return createdTask.id;
    } catch (error) {
      throw new Error('Error creating Task: ', { cause: error });
    }
  }

  async update(
    taskId: string,
    {
      title,
      description,
      type,
      priority,
      assignee,
      reporter,
      dueDate,
      statusId,
      parentId,
    }: CreateTaskBody,
  ): Promise<void> {
    try {
      const existingTask = await db.task.findUnique({
        where: {
          id: taskId,
        },
      });

      if (!existingTask) {
        throw new Error('Task with the given taskId does not exist');
      }

      if (type === 'STORY') {
        parentId = null;
      }

      const childCount = await db.task.count({
        where: {
          parentId: taskId,
        },
      });

      const isStoryUpdate = type === 'STORY' && existingTask.type === 'STORY';
      const nextStatusId =
        isStoryUpdate && childCount > 0 ? existingTask.statusId : statusId;

      await db.task.update({
        data: {
          title,
          description,
          type: type as TaskType,
          priority: priority as Priority,
          assignee,
          dueDate: dueDate,
          statusId: nextStatusId,
          parentId,
        },
        where: {
          id: taskId,
        },
      });

      console.log(parentId);

      await db.activity.create({
        data: {
          taskId,
          type: 'TASK_ASSIGNEE_CHANGED',
          oldAssigneeId: existingTask.assignee, // PlaceHolder value since old assignee does not exist
          newAssigneeId: assignee,
          userId: reporter,
        },
      });

      if (existingTask.parentId) {
        await syncStatusWithChildren(existingTask.parentId);
      }

      if (existingTask.statusId && nextStatusId) {
        if (existingTask.statusId !== nextStatusId) {
          await db.activity.create({
            data: {
              type: 'TASK_STATUS_UPDATED',
              taskId,
              oldStatusId: existingTask.statusId,
              newStatusId: nextStatusId,
              userId: reporter,
            },
          });

          await notificationService.createNotification({
            taskId,
            type: NotifType.STATUS_CHANGED,
            senderId: reporter,
            recipientId: assignee,
            commentId: null,
            threadId: null,
          });

          sendNotif(
            reporter,
            assignee,
            `Assigned Task Status Updated: ${title}`,
          );
        }
      }

      if (existingTask.assignee && assignee) {
        if (existingTask.assignee !== assignee) {
          await db.activity.create({
            data: {
              taskId,
              type: 'TASK_ASSIGNEE_CHANGED',
              oldAssigneeId: existingTask.assignee,
              newAssigneeId: assignee,
              userId: reporter,
            },
          });

          await notificationService.createNotification({
            taskId,
            type: NotifType.TASK_ASSIGNED,
            senderId: reporter,
            recipientId: assignee,
            commentId: null,
            threadId: null,
          });

          sendNotif(
            reporter,
            assignee,
            `You have been assigned a new task: ${title}`,
          );
        }
      }
    } catch (error) {
      throw new Error('Error updating Task: ', { cause: error });
    }
  }

  async delete(taskId: string): Promise<void> {
    try {
      const existingTask = await db.task.findUnique({
        where: {
          id: taskId,
        },
      });

      if (!existingTask) {
        throw new Error('Task with the given taskId does not exist');
      }

      await db.task.delete({
        where: {
          id: taskId,
        },
      });

      if (existingTask.parentId) {
        await syncStatusWithChildren(existingTask.parentId);
      }
    } catch (error) {
      throw new Error('Error deleting task: ', { cause: error });
    }
  }

  async getTask(taskId: string): Promise<TaskDTO> {
    try {
      const existingTask = await db.task.findUnique({
        where: {
          id: taskId,
        },
        include: {
          children: true,
          activities: {
            include: {
              user: true,
              oldAssignee: true,
              newAssignee: true,
              oldStatus: true,
              newStatus: true,
              comment: true,
              thread: true,
            },
          },
          threads: {
            include: {
              comments: {
                where: {
                  parentId: null,
                },
              },
            },
          },
        },
      });

      if (!existingTask) {
        throw new Error('Task with the given taskId does not exist');
      }

      return toTaskDTO(existingTask);
    } catch (err) {
      throw new Error('Error fetching task: ', { cause: err });
    }
  }
}

export const taskService = new TaskService();
