import * as http from 'node:http';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert';

import { app } from '../src/app';
import { generateAuthTokens } from '../src/utils/jwt';
import { prisma } from '../lib/prisma';
import type { Prisma } from '../generated/prisma/client';
import type { PrismaClient } from '@prisma/client/extension';
import { ProjectRole } from '../src/types/project.types';
import { initWSServer, shutdownWSServer } from '../src/websocket/ws.service';

describe('Comment API Endpoints (RBAC)', () => {
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
  const threadId = 'thread-1';
  const commentId = 'comment-1';
  const userId = 1;
  const otherUserId = 2;
  const userEmail = 'author@node.test';
  const otherEmail = 'viewer@node.test';

  const commentBaseUrl = (): string => `${baseUrl}/api/comment`;

  const authCookieFor = (email = userEmail, id = userId): string => {
    const { refreshToken } = generateAuthTokens(
      id,
      email,
      `session-${Date.now()}`,
    );
    return `refreshToken=${refreshToken}`;
  };

  const hasProjectIdSelect = (args: Prisma.TaskFindUniqueArgs): boolean => {
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

  const hasThreadTaskIdSelect = (
    args: Prisma.CommentFindUniqueArgs,
  ): boolean => {
    const select = args.select;
    if (!select || typeof select !== 'object') {
      return false;
    }

    const thread = (select as { thread?: unknown }).thread;
    if (!thread || typeof thread !== 'object') {
      return false;
    }

    if (!('select' in thread)) {
      return false;
    }

    const threadSelect = (thread as { select?: unknown }).select;
    return !!(
      threadSelect &&
      typeof threadSelect === 'object' &&
      'taskId' in threadSelect
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

        if (args.where?.email) {
          if (args.where.email === currentUser.email) {
            return {
              id: currentUser.id,
              name: 'Comment User',
              email: currentUser.email,
              globalRole: currentUser.globalRole,
              notifications: [],
              avatar: null,
              projects: [],
            };
          }

          if (args.where.email === otherEmail) {
            return {
              id: otherUserId,
              name: 'Other User',
              email: otherEmail,
              globalRole: 'USER',
              notifications: [],
              avatar: null,
              projects: [],
            };
          }

          return null;
        }

        if (args.where?.id === currentUser.id) {
          return {
            id: currentUser.id,
            name: 'Comment User',
            email: currentUser.email,
            globalRole: currentUser.globalRole,
            notifications: [],
            avatar: null,
            projects: [],
          };
        }

        return {
          id: otherUserId,
          name: 'Other User',
          email: otherEmail,
          globalRole: 'USER',
          notifications: [],
          avatar: null,
          projects: [],
        };
      },
      findFirst: async () => null,
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

    db.task = {
      findUnique: async (args: Prisma.TaskFindUniqueArgs) => {
        if (hasProjectIdSelect(args)) {
          return {
            status: {
              board: {
                projectId,
              },
            },
          };
        }

        return {
          id: taskId,
          title: 'Sample Task',
          assignee: otherUserId,
          status: {
            board: {
              projectId,
            },
          },
        };
      },
    };

    db.thread = {
      create: async (args: Prisma.ThreadCreateArgs) => ({
        id: threadId,
        title: args.data.title,
        content: args.data.content ?? null,
        taskId: args.data.taskId,
        authorId: args.data.authorId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findUnique: async (args: Prisma.ThreadFindUniqueArgs) => {
        if (args.select?.taskId) {
          return { taskId };
        }

        if (args.include?.comments) {
          return {
            id: threadId,
            title: 'Thread Title',
            content: 'Thread body',
            taskId,
            authorId: userId,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            comments: [
              {
                id: commentId,
                parentId: null,
              },
            ],
          };
        }

        return {
          id: threadId,
          title: 'Thread Title',
          content: 'Thread body',
          taskId,
          authorId: userId,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
      update: async (args: Prisma.ThreadUpdateArgs) => ({
        id: args.where.id,
        title: args.data.title ?? 'Updated Thread',
        content: args.data.content ?? null,
        taskId,
        authorId: userId,
        isDeleted: args.data.isDeleted ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    db.comment = {
      create: async (args: Prisma.CommentCreateArgs) => ({
        id: commentId,
        content: args.data.content,
        threadId: args.data.threadId,
        authorId: args.data.authorId,
        parentId: args.data.parentId ?? null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [],
      }),
      findUnique: async (args: Prisma.CommentFindUniqueArgs) => {
        if (hasThreadTaskIdSelect(args)) {
          return {
            thread: {
              taskId,
            },
            parentId: null,
          };
        }

        if (args.include?.replies) {
          return {
            id: commentId,
            content: 'Comment body',
            threadId,
            authorId: userId,
            parentId: null,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            replies: [],
          };
        }

        return {
          id: commentId,
          content: 'Comment body',
          threadId,
          authorId: userId,
          parentId: null,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
      update: async (args: Prisma.CommentUpdateArgs) => ({
        id: args.where.id,
        content: args.data.content ?? 'Updated Comment',
        threadId,
        authorId: userId,
        parentId: null,
        isDeleted: args.data.isDeleted ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
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

  test('POST /api/comment/create-thread should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${commentBaseUrl()}/create-thread`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        taskId,
        title: 'Thread Title',
        content: 'Thread body',
        authorId: userId,
        isDeleted: false,
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status?: string;
      thread?: { id?: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.thread?.id, threadId);
  });

  test('POST /api/comment/create-thread should reject viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${commentBaseUrl()}/create-thread`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        taskId,
        title: 'Thread Title',
        content: 'Thread body',
        authorId: userId,
        isDeleted: false,
      }),
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('POST /api/comment/create-comment should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${commentBaseUrl()}/create-comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        taskId,
        threadId,
        authorId: userId,
        content: 'Comment body',
        isDeleted: false,
        parentId: null,
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status?: string;
      comment?: { id?: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.comment?.id, commentId);
  });

  test('POST /api/comment/create-comment should reject viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${commentBaseUrl()}/create-comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        taskId,
        threadId,
        authorId: userId,
        content: 'Comment body',
        isDeleted: false,
        parentId: null,
      }),
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('PATCH /api/comment/update-thread/:tid should allow thread author', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/update-thread/${threadId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          taskId,
          title: 'Updated Thread',
          content: 'Updated body',
          isDeleted: false,
        }),
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { status?: string };
    assert.equal(data.status, 'success');
  });

  test('PATCH /api/comment/update-thread/:tid should reject non-author', async () => {
    currentUser = {
      id: otherUserId,
      email: otherEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/update-thread/${threadId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(otherEmail, otherUserId),
        },
        body: JSON.stringify({
          taskId,
          title: 'Updated Thread',
          content: 'Updated body',
          isDeleted: false,
        }),
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'User is not the author of the thread');
  });

  test('PATCH /api/comment/update-comment/:cid should allow comment author', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/update-comment/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          taskId,
          threadId,
          content: 'Updated comment',
          isDeleted: false,
        }),
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { status?: string };
    assert.equal(data.status, 'success');
  });

  test('PATCH /api/comment/update-comment/:cid should reject non-author', async () => {
    currentUser = {
      id: otherUserId,
      email: otherEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/update-comment/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(otherEmail, otherUserId),
        },
        body: JSON.stringify({
          taskId,
          threadId,
          content: 'Updated comment',
          isDeleted: false,
        }),
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'User is not the author of the comment');
  });

  test('PATCH /api/comment/delete-thread/:tid should allow thread author', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/delete-thread/${threadId}`,
      {
        method: 'PATCH',
        headers: {
          Cookie: authCookieFor(),
        },
      },
    );

    assert.equal(response.status, 204);
  });

  test('PATCH /api/comment/delete-thread/:tid should reject non-author', async () => {
    currentUser = {
      id: otherUserId,
      email: otherEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/delete-thread/${threadId}`,
      {
        method: 'PATCH',
        headers: {
          Cookie: authCookieFor(otherEmail, otherUserId),
        },
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'User is not the author of the thread');
  });

  test('PATCH /api/comment/delete-comment/:cid should allow comment author', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/delete-comment/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          threadId,
        }),
      },
    );

    assert.equal(response.status, 204);
  });

  test('PATCH /api/comment/delete-comment/:cid should reject non-author', async () => {
    currentUser = {
      id: otherUserId,
      email: otherEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(
      `${commentBaseUrl()}/delete-comment/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(otherEmail, otherUserId),
        },
        body: JSON.stringify({
          threadId,
        }),
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'User is not the author of the comment');
  });

  test('GET /api/comment/t/:cid should allow viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${commentBaseUrl()}/t/${commentId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      status?: string;
      comment?: { id?: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.comment?.id, commentId);
  });

  test('GET /api/comment/t/:cid should reject non-member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(`${commentBaseUrl()}/t/${commentId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Not a global user');
  });

  test('GET /api/comment/:tid should allow viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${commentBaseUrl()}/${threadId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      status?: string;
      thread?: { id?: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.thread?.id, threadId);
  });

  test('GET /api/comment/:tid should reject non-member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(`${commentBaseUrl()}/${threadId}`, {
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
