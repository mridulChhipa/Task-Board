import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';

import { NotificationService } from '../../src/services/notification.service';
import { prisma } from '../../lib/prisma';
import type { PrismaClient } from '@prisma/client/extension';
import { NotifType } from '../../src/types/notifcation.types';

describe('NotificationService', () => {
  let service: NotificationService;
  const db: PrismaClient = prisma;

  beforeEach(() => {
    service = new NotificationService();
  });

  test('createNotification returns dto', async () => {
    db.notification = {
      create: async (args: any) => ({
        id: 'notification-1',
        senderId: args.data.senderId,
        recipientId: args.data.recipientId,
        taskId: args.data.taskId,
        commentId: args.data.commentId,
        threadId: args.data.threadId,
        type: args.data.type,
        read: false,
        recipient: { id: args.data.recipientId, name: 'Recipient' },
        sender: { id: args.data.senderId, name: 'Sender' },
      }),
    };

    const notif = await service.createNotification({
      recipientId: 1,
      senderId: 2,
      taskId: 'task-1',
      commentId: null,
      threadId: null,
      type: NotifType.TASK_ASSIGNED,
    });

    assert.equal(notif.id, 'notification-1');
    assert.equal(notif.recipientName, 'Recipient');
  });

  test('createNotification rejects create failure', async () => {
    db.notification = {
      create: async () => {
        throw new Error('create failed');
      },
    };

    await assert.rejects(
      () =>
        service.createNotification({
          recipientId: 1,
          senderId: 2,
          taskId: 'task-1',
          commentId: null,
          threadId: null,
          type: NotifType.TASK_ASSIGNED,
        }),
      /Can't create notification/,
    );
  });

  test('fetchNotification returns dto', async () => {
    db.notification = {
      findUnique: async () => ({
        id: 'notification-1',
        senderId: 2,
        recipientId: 1,
        taskId: 'task-1',
        commentId: null,
        threadId: null,
        type: NotifType.TASK_ASSIGNED,
        read: false,
        recipient: { id: 1, name: 'Recipient' },
        sender: { id: 2, name: 'Sender' },
      }),
    };

    const notif = await service.fetchNotification('notification-1');

    assert.equal(notif.id, 'notification-1');
    assert.equal(notif.recipientName, 'Recipient');
  });

  test('fetchNotification rejects missing notification', async () => {
    db.notification = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () => service.fetchNotification('missing'),
      /Can't find notification/,
    );
  });

  test('fetchNotification rejects fetch failure', async () => {
    db.notification = {
      findUnique: async () => {
        throw new Error('fetch failed');
      },
    };

    await assert.rejects(
      () => service.fetchNotification('notification-1'),
      /fetch failed/,
    );
  });

  test('deleteNotification removes notification', async () => {
    let deleteArgs: any = null;
    db.notification = {
      delete: async (args: any) => {
        deleteArgs = args;
        return { id: args.where.id };
      },
    };

    await service.deleteNotification('notification-1');

    assert.equal(deleteArgs?.where.id, 'notification-1');
  });

  test('deleteNotification rejects delete failure', async () => {
    db.notification = {
      delete: async () => {
        throw new Error('delete failed');
      },
    };

    await assert.rejects(
      () => service.deleteNotification('notification-1'),
      /Can't delete notification/,
    );
  });

  test('readNotification updates read status', async () => {
    let updateArgs: any = null;
    db.notification = {
      update: async (args: any) => {
        updateArgs = args;
        return { id: args.where.id, read: args.data.read };
      },
    };

    await service.readNotification('notification-1', true);

    assert.equal(updateArgs?.data.read, true);
  });

  test('readNotification rejects update failure', async () => {
    db.notification = {
      update: async () => {
        throw new Error('update failed');
      },
    };

    await assert.rejects(
      () => service.readNotification('notification-1', true),
      /Can't read notification/,
    );
  });
});
