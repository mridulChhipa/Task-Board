import type { Priority, TaskType } from '../../generated/prisma/enums';
import { db } from '../config/db';
import type { TaskBody } from '../types/task.types';

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
    stackPosition,
  }: TaskBody): Promise<void> {
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
          stackPosition: stackPosition,
        },
      });
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
      stackPosition,
    }: TaskBody,
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
          stackPosition,
        },
        where: {
          id: taskId,
        },
      });
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
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
