import type { Priority, TaskType } from '../../generated/prisma/enums';
import { db } from '../config/db';
import type { CreateTaskBody, TaskDTO } from '../types/task.types';
import { syncStatusWithChildren, toTaskDTO } from '../utils/task.utils';

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
    stackPosition,
  }: CreateTaskBody): Promise<void> {
    try {
      await db.task.create({
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
          stackPosition: stackPosition,
        },
      });

      if (parentId) {
        await syncStatusWithChildren(parentId);
      }
    } catch (error) {
      console.log(error);
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
      stackPosition,
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

      if (existingTask.stackPosition > stackPosition) {
        throw new Error('Invalid status transition');
      }

      await db.task.update({
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
          stackPosition,
        },
        where: {
          id: taskId,
        },
      });

      if (existingTask.parentId) {
        await syncStatusWithChildren(existingTask.parentId);
      }

      if (existingTask.statusId && statusId) {
        if (existingTask.statusId !== statusId) {
          await db.activity.create({
            data: {
              type: 'TASK_STATUS_UPDATED',
              taskId,
              oldStatusId: existingTask.statusId,
              newStatusId: statusId,
            },
          });
        }
      }

      if (existingTask.assignee && assignee) {
        if (existingTask.assignee !== assignee) {
          await db.activity.create({
            data: {
              taskId,
              type: 'TASK_ASSIGNEE_CHANGED',
              oldAssignee: existingTask.assignee,
              newAssignee: assignee,
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
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
      console.log(error);
      throw error;
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
        },
      });

      if (!existingTask) {
        throw new Error('Task with the given taskId does not exist');
      }

      // VSCode automatically tells if await is needed or not
      return toTaskDTO(existingTask);
    } catch (err) {
      console.log('From service fetch task ', err);
      throw err;
    }
  }
}

export const taskService = new TaskService();
