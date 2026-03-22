import * as http from 'node:http';
import { before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';

import { TaskService } from '../../src/services/task.service';
import { prisma } from '../../lib/prisma';
import type { PrismaClient } from '@prisma/client/extension';
import { PriorityType, TaskType } from '../../src/types/task.types';
import { notificationService } from '../../src/services/notification.service';
import { initWSServer, shutdownWSServer } from '../../src/websocket/ws.service';

// Ensure sendNotif has a ws server instance to call.
let wsServer: ReturnType<typeof initWSServer> | null = null;

describe('TaskService', () => {
  let service: TaskService;
  const db: PrismaClient = prisma;

  before(() => {
    const server = http.createServer();
    wsServer = initWSServer(server);
    if (wsServer) {
      wsServer.sendNotification = () => {};
    }
  });

  beforeEach(() => {
    service = new TaskService();
    notificationService.createNotification = (async () => ({
      id: 'notif-1',
    })) as any;
  });

  test('create returns task id', async () => {
    let createArgs: any = null;
    db.task = {
      create: async (args: any) => {
        createArgs = args;
        return {
          id: 'task-1',
          ...args.data,
        };
      },
    };

    const taskId = await service.create({
      title: 'Task Title',
      description: 'Task Desc',
      type: TaskType.TASK,
      priority: PriorityType.MEDIUM,
      assignee: 2,
      reporter: 1,
      dueDate: new Date(),
      statusId: 'status-1',
      parentId: null,
      resolvedAt: null,
      closedAt: null,
    });

    assert.equal(taskId, 'task-1');
    assert.equal(createArgs?.data.title, 'Task Title');
  });

  test('create rejects closed without resolved', async () => {
    await assert.rejects(
      () =>
        service.create({
          title: 'Task Title',
          description: 'Task Desc',
          type: TaskType.TASK,
          priority: PriorityType.MEDIUM,
          assignee: 2,
          reporter: 1,
          dueDate: new Date(),
          statusId: 'status-1',
          parentId: null,
          resolvedAt: null,
          closedAt: new Date(),
        }),
      /Closed task must be resolved first/,
    );
  });

  test('update writes task fields', async () => {
    let updateArgs: any = null;
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Task Title',
        type: TaskType.TASK,
        priority: PriorityType.MEDIUM,
        assignee: 1,
        reporter: 1,
        statusId: 'status-1',
        parentId: null,
      }),
      count: async () => 0,
      update: async (args: any) => {
        updateArgs = args;
        return {
          id: args.where.id,
          ...args.data,
        };
      },
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };

    await service.update('task-1', {
      title: 'Updated Title',
      description: 'Updated Desc',
      type: TaskType.TASK,
      priority: PriorityType.HIGH,
      assignee: 2,
      reporter: 1,
      dueDate: new Date(),
      statusId: 'status-2',
      parentId: null,
      resolvedAt: null,
      closedAt: null,
    });

    assert.equal(updateArgs?.where.id, 'task-1');
    assert.equal(updateArgs?.data.title, 'Updated Title');
    assert.equal(updateArgs?.data.statusId, 'status-2');
  });

  test('update keeps status for story with children', async () => {
    let updateArgs: any = null;
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Story',
        type: TaskType.STORY,
        priority: PriorityType.MEDIUM,
        assignee: 1,
        reporter: 1,
        statusId: 'status-1',
        parentId: null,
      }),
      count: async () => 2,
      update: async (args: any) => {
        updateArgs = args;
        return {
          id: args.where.id,
          ...args.data,
        };
      },
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };

    await service.update('task-1', {
      title: 'Story',
      description: 'Story Desc',
      type: TaskType.STORY,
      priority: PriorityType.MEDIUM,
      assignee: 1,
      reporter: 1,
      dueDate: new Date(),
      statusId: 'status-2',
      parentId: null,
      resolvedAt: null,
      closedAt: null,
    });

    assert.equal(updateArgs?.data.statusId, 'status-1');
  });

  test('delete removes task', async () => {
    let deleteArgs: any = null;
    db.task = {
      findUnique: async () => ({ id: 'task-1', parentId: null }),
      delete: async (args: any) => {
        deleteArgs = args;
        return { id: args.where.id };
      },
    };

    await service.delete('task-1');

    assert.equal(deleteArgs?.where.id, 'task-1');
  });

  test('getTask returns dto', async () => {
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Task',
        description: 'Desc',
        type: TaskType.TASK,
        priority: PriorityType.MEDIUM,
        assignee: 1,
        reporter: 1,
        dueDate: null,
        statusId: 'status-1',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        closedAt: null,
        children: [],
        activities: [
          {
            id: 'activity-1',
            type: 'TASK_STATUS_UPDATED',
            timestamp: new Date(),
            thread: null,
            comment: null,
            oldStatus: null,
            newStatus: null,
            oldAssignee: null,
            newAssignee: null,
            user: null,
          },
        ],
        threads: [
          {
            id: 'thread-1',
            title: 'Thread',
            content: 'Thread content',
            taskId: 'task-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
            authorId: 1,
            author: { id: 1, name: 'User' },
            comments: [{ id: 'comment-1' }],
          },
        ],
      }),
    };

    const task = await service.getTask('task-1');

    assert.equal(task.id, 'task-1');
    assert.equal(task.threads[0]?.authorName, 'User');
    assert.equal(task.activities[0]?.id, 'activity-1');
  });

  test('getTask rejects missing task', async () => {
    db.task = {
      findUnique: async () => null,
    };

    await assert.rejects(() => service.getTask('task-1'), /given taskId does not exist/);
  });
});

process.on('exit', () => {
  if (wsServer) {
    shutdownWSServer();
  }
});
