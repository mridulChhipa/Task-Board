import * as http from 'node:http';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert';

import { app } from '../src/app';
import { generateAuthTokens } from '../src/utils/jwt';
import { prisma } from '../lib/prisma';
import type { Prisma } from '../generated/prisma/client';
import type { PrismaClient } from '@prisma/client/extension';
import { NotifType } from '../src/types/notifcation.types';

describe('Notification API Endpoints', () => {
  let server: http.Server;
  let baseUrl: string;

  const db: PrismaClient = prisma;

  let currentUser: {
    id: number;
    email: string;
    globalRole: string;
  } | null = null;

  const notificationId = 'notification-1';
  const userId = 1;
  const userEmail = 'recipient@node.test';
  const otherUserId = 2;
  const otherEmail = 'sender@node.test';

  const notificationBaseUrl = (): string => `${baseUrl}/api/notification`;

  const authCookieFor = (email = userEmail, id = userId): string => {
    const { refreshToken } = generateAuthTokens(
      id,
      email,
      `session-${Date.now()}`,
    );
    return `refreshToken=${refreshToken}`;
  };

  const hasRecipientSelect = (
    args: Prisma.NotificationFindUniqueArgs,
  ): boolean => {
    const select = args.select;
    if (!select || typeof select !== 'object') {
      return false;
    }

    return 'recipientId' in select;
  };

  before(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ISSUER = 'test-issuer';

    server = http.createServer(app);

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
          name: 'Notification User',
          email: currentUser.email,
          globalRole: currentUser.globalRole,
          notifications: [],
          avatar: null,
          projects: [],
        };
      },
    };

    db.notification = {
      create: async (args: Prisma.NotificationCreateArgs) => ({
        id: notificationId,
        senderId: args.data.senderId,
        recipientId: args.data.recipientId,
        taskId: args.data.taskId,
        commentId: args.data.commentId,
        threadId: args.data.threadId,
        type: args.data.type,
        read: false,
        recipient: {
          id: args.data.recipientId,
          name: 'Recipient User',
        },
      }),
      findUnique: async (args: Prisma.NotificationFindUniqueArgs) => {
        if (hasRecipientSelect(args)) {
          return { recipientId: userId };
        }

        return {
          id: notificationId,
          senderId: otherUserId,
          recipientId: userId,
          taskId: 'task-1',
          commentId: null,
          threadId: null,
          type: NotifType.TASK_ASSIGNED,
          read: false,
          recipient: {
            id: userId,
            name: 'Recipient User',
          },
        };
      },
      delete: async (args: Prisma.NotificationDeleteArgs) => ({
        id: args.where.id,
      }),
      update: async (args: Prisma.NotificationUpdateArgs) => ({
        id: args.where.id,
        read: args.data.read ?? false,
      }),
    };
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  test('POST /api/notification/create should create notification', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };

    const response = await fetch(`${notificationBaseUrl()}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        senderId: otherUserId,
        recipientId: userId,
        taskId: 'task-1',
        commentId: null,
        threadId: null,
        type: NotifType.TASK_ASSIGNED,
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status?: string;
      notification?: { id?: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.notification?.id, notificationId);
  });

  test('GET /api/notification/:nid should allow owner', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };

    const response = await fetch(`${notificationBaseUrl()}/${notificationId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status?: string;
      notifcation?: { id?: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.notifcation?.id, notificationId);
  });

  test('GET /api/notification/:nid should reject non-owner', async () => {
    currentUser = {
      id: otherUserId,
      email: otherEmail,
      globalRole: 'USER',
    };

    const response = await fetch(`${notificationBaseUrl()}/${notificationId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(otherEmail, otherUserId),
      },
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Not allowed to access this notification');
  });

  test('DELETE /api/notification/:nid should allow owner', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };

    const response = await fetch(`${notificationBaseUrl()}/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 204);
  });

  test('DELETE /api/notification/:nid should reject non-owner', async () => {
    currentUser = {
      id: otherUserId,
      email: otherEmail,
      globalRole: 'USER',
    };

    const response = await fetch(`${notificationBaseUrl()}/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(otherEmail, otherUserId),
      },
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Not allowed to access this notification');
  });

  test('PATCH /api/notification/:nid should allow owner to update read status', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };

    const response = await fetch(`${notificationBaseUrl()}/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        read: true,
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { status?: string };
    assert.equal(data.status, 'success');
  });

  test('PATCH /api/notification/:nid should reject non-owner', async () => {
    currentUser = {
      id: otherUserId,
      email: otherEmail,
      globalRole: 'USER',
    };

    const response = await fetch(`${notificationBaseUrl()}/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(otherEmail, otherUserId),
      },
      body: JSON.stringify({
        read: true,
      }),
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg?: string };
    assert.equal(data.msg, 'Not allowed to access this notification');
  });
});
