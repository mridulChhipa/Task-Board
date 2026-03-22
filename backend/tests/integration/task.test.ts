import * as http from 'node:http';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert';

import { app } from '../../src/app';
import { generateAuthTokens } from '../../src/utils/jwt';
import { prisma } from '../../lib/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { PrismaClient } from '@prisma/client/extension';
import { ProjectRole } from '../../src/types/project.types';
import { PriorityType, TaskType } from '../../src/types/task.types';
import { initWSServer, shutdownWSServer } from '../../src/websocket/ws.service';

describe('Task API Endpoints (RBAC)', () => {
  let server: http.Server;
  let baseUrl: string;

  const db: PrismaClient = prisma;

  let currentUser: {
    id: number;
    email: string;
    globalRole: string;
  } | null = null;

  let membershipRole: ProjectRole | null = null;

  const projectId = 'project-1';
  const taskId = 'task-1';
  const statusId = 'status-1';
  const userId = 1;
  const userEmail = 'reporter@node.test';
  const assigneeId = 2;

  const taskBaseUrl = (): string => `${baseUrl}/api/task`;

  const authCookieFor = (email = userEmail, id = userId): string => {
    const { refreshToken } = generateAuthTokens(
      id,
      email,
      `session-${Date.now()}`,
    );
    return `refreshToken=${refreshToken}`;
  };

  const hasProjectSelect = (args: Prisma.TaskFindUniqueArgs): boolean => {
    const select = args.select;
    if (!select || typeof select !== 'object') {
      return false;
    }

    const status = (select as { status?: unknown }).status;
    if (!status || typeof status !== 'object') {
      return false;
    }

    if (!('select' in status)) {
      return false;
    }

    const statusSelect = (status as { select?: unknown }).select;
    if (!statusSelect || typeof statusSelect !== 'object') {
      return false;
    }

    const board = (statusSelect as { board?: unknown }).board;
    if (!board || typeof board !== 'object') {
      return false;
    }

    if (!('select' in board)) {
      return false;
    }

    const boardSelect = (board as { select?: unknown }).select;
    return !!(
      boardSelect &&
      typeof boardSelect === 'object' &&
      'projectId' in boardSelect
    );
  };

  const hasWorkflowProjectSelect = (
    args: Prisma.WorkflowFindUniqueArgs,
  ): boolean => {
    const select = args.select;
    if (!select || typeof select !== 'object') {
      return false;
    }

    const board = (select as { board?: unknown }).board;
    if (!board || typeof board !== 'object') {
      return false;
    }

    if (!('select' in board)) {
      return false;
    }

    const boardSelect = (board as { select?: unknown }).select;
    return !!(
      boardSelect &&
      typeof boardSelect === 'object' &&
      'projectId' in boardSelect
    );
  };

  before(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ISSUER = 'test-issuer';

    server = http.createServer(app);
    initWSServer(server);

    await new Promise<void>((resolve, reject) => {
      server.listen(0, () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 80;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
      server.on('error', reject);
    });

    db.user = {
      findUnique: async (args: Prisma.UserFindUniqueArgs) => {
        if (!currentUser) {
          return null;
        }

        if (args.where?.email && args.where.email !== currentUser.email) {
          return null;
        }

        return {
          id: currentUser.id,
          name: 'Task User',
          email: currentUser.email,
          globalRole: currentUser.globalRole,
          notifications: [],
          avatar: null,
          projects: [],
        };
      },
    };

    db.projectMember = {
      findUnique: async (args: Prisma.ProjectMemberFindUniqueArgs) => {
        const memberId = args.where.uniqueUser?.userId;
        if (memberId !== userId || !membershipRole) {
          return null;
        }

        return {
          projectId,
          userId,
          role: membershipRole,
        };
      },
    };

    db.workflow = {
      findUnique: async (args: Prisma.WorkflowFindUniqueArgs) => {
        if (hasWorkflowProjectSelect(args)) {
          return {
            board: {
              projectId,
            },
          };
        }

        return {
          id: statusId,
          name: 'Todo',
          boardId: 'board-1',
          orderIdx: 0,
          limit: 5,
        };
      },
    };

    db.task = {
      create: async (args: Prisma.TaskCreateArgs) => ({
        id: taskId,
        title: args.data.title,
        description: args.data.description ?? null,
        type: args.data.type,
        priority: args.data.priority,
        assignee: args.data.assignee,
        reporter: args.data.reporter,
        dueDate: args.data.dueDate ?? null,
        statusId: args.data.statusId,
        parentId: args.data.parentId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        closedAt: null,
      }),
      findUnique: async (args: Prisma.TaskFindUniqueArgs) => {
        if (hasProjectSelect(args)) {
          return {
            status: {
              board: {
                projectId,
              },
            },
          };
        }

        if (args.include) {
          return {
            id: taskId,
            title: 'Sample Task',
            description: 'Details',
            type: TaskType.TASK,
            priority: PriorityType.MEDIUM,
            assignee: assigneeId,
            reporter: userId,
            dueDate: null,
            statusId,
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            resolvedAt: null,
            closedAt: null,
            children: [],
            activities: [],
            threads: [],
          };
        }

        return {
          id: taskId,
          title: 'Sample Task',
          description: 'Details',
          type: TaskType.TASK,
          priority: PriorityType.MEDIUM,
          assignee: assigneeId,
          reporter: userId,
          dueDate: null,
          statusId,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          resolvedAt: null,
          closedAt: null,
        };
      },
      update: async (args: Prisma.TaskUpdateArgs) => ({
        id: args.where.id,
        title: args.data.title ?? 'Updated Task',
        description: args.data.description ?? null,
        type: args.data.type ?? TaskType.TASK,
        priority: args.data.priority ?? PriorityType.MEDIUM,
        assignee: args.data.assignee ?? assigneeId,
        reporter: userId,
        dueDate: args.data.dueDate ?? null,
        statusId: args.data.statusId ?? statusId,
        parentId: args.data.parentId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        closedAt: null,
      }),
      delete: async (args: Prisma.TaskDeleteArgs) => ({
        id: args.where.id,
      }),
      count: async () => 0,
    };

    db.activity = {
      create: async () => ({
        id: 'activity-1',
      }),
    };

    db.notification = {
      create: async (args: Prisma.NotificationCreateArgs) => ({
        id: 'notification-1',
        senderId: args.data.senderId,
        recipientId: args.data.recipientId,
        taskId: args.data.taskId,
        commentId: args.data.commentId,
        threadId: args.data.threadId,
        type: args.data.type,
        read: false,
        recipient: {
          id: args.data.recipientId,
          name: 'Recipient',
        },
        sender: {
          id: args.data.senderId,
          name: 'Sender',
        },
      }),
    };
  });

  after(async () => {
    shutdownWSServer();
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  test('POST /api/task/create should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${taskBaseUrl()}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        title: 'Task Title',
        description: 'Details',
        type: TaskType.TASK,
        priority: PriorityType.MEDIUM,
        assignee: assigneeId,
        reporter: userId,
        dueDate: new Date().toISOString(),
        statusId,
        parentId: null,
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status?: string;
      taskId?: string;
    };
    assert.equal(data.status, 'success');
    assert.equal(data.taskId, taskId);
  });

  test('POST /api/task/create should reject viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${taskBaseUrl()}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        title: 'Task Title',
        description: 'Details',
        type: TaskType.TASK,
        priority: PriorityType.MEDIUM,
        assignee: assigneeId,
        reporter: userId,
        dueDate: new Date().toISOString(),
        statusId,
        parentId: null,
      }),
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('PUT /api/task/update/:taskId should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${taskBaseUrl()}/update/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        title: 'Updated Task',
        description: 'Updated',
        type: TaskType.TASK,
        priority: PriorityType.HIGH,
        assignee: assigneeId,
        reporter: userId,
        dueDate: new Date().toISOString(),
        statusId,
        parentId: null,
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { status?: string; msg?: string };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Task updated successfully');
  });

  test('PUT /api/task/update/:taskId should reject viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${taskBaseUrl()}/update/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        title: 'Updated Task',
        description: 'Updated',
        type: TaskType.TASK,
        priority: PriorityType.HIGH,
        assignee: assigneeId,
        reporter: userId,
        dueDate: new Date().toISOString(),
        statusId,
        parentId: null,
      }),
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('DELETE /api/task/delete/:taskId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;

    const response = await fetch(`${taskBaseUrl()}/delete/${taskId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { status?: string; msg?: string };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Task deleted successfully');
  });

  test('DELETE /api/task/delete/:taskId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${taskBaseUrl()}/delete/${taskId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('GET /api/task/:taskId should allow viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${taskBaseUrl()}/${taskId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { task?: { id?: string } };
    assert.equal(data.task?.id, taskId);
  });

  test('GET /api/task/:taskId should reject non-member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(`${taskBaseUrl()}/${taskId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Not a global user');
  });
});
