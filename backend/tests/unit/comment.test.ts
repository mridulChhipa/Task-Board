import * as http from 'node:http';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';

import { CommentService } from '../../src/services/comment.service';
import { prisma } from '../../lib/prisma';
import type { PrismaClient } from '@prisma/client/extension';
import { notificationService } from '../../src/services/notification.service';
import { initWSServer, shutdownWSServer } from '../../src/websocket/ws.service';
import { NotifType } from '../../src/types/notifcation.types';
import type {
  ThreadCreateArgs,
  ThreadUpdateArgs,
  CommentCreateArgs,
  CommentUpdateArgs,
  CreateNotificationPayload,
  NotificationDTO,
} from '../test.types';

// Ensure sendNotif has a ws server instance to call.
let wsServer: ReturnType<typeof initWSServer> | null = null;

describe('CommentService', () => {
  let service: CommentService;
  const db: PrismaClient = prisma;

  before(() => {
    const server = http.createServer();
    wsServer = initWSServer(server);
    if (wsServer) {
      wsServer.sendNotification = () => {};
    }
  });

  after(() => {
    shutdownWSServer();
  });

  beforeEach(() => {
    service = new CommentService();
    notificationService.createNotification = (async () => {
      return {
        id: 'notif-1',
        type: NotifType.COMMENT_ADDED,
        recipientId: 1,
        senderId: 2,
        taskId: null,
        commentId: null,
        threadId: null,
        recipientName: 'Recipient',
        senderName: 'Sender',
        read: false,
      } as NotificationDTO;
    }) as unknown as (
      payload: CreateNotificationPayload,
    ) => Promise<NotificationDTO>;
  });

  test('createThread returns created thread', async () => {
    db.thread = {
      create: async (args: ThreadCreateArgs) => ({
        id: 'thread-1',
        title: args.data.title,
        content: args.data.content ?? null,
        taskId: args.data.taskId,
        authorId: args.data.authorId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Task',
        assignee: 2,
      }),
    };

    const thread = await service.createThread({
      taskId: 'task-1',
      title: 'Thread Title',
      content: 'Thread body',
      authorId: 1,
      isDeleted: false,
    });

    assert.equal(thread.id, 'thread-1');
    assert.equal(thread.taskId, 'task-1');
  });

  test('createThread rejects missing task', async () => {
    db.thread = {
      create: async () => ({ id: 'thread-1' }),
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };
    db.task = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () =>
        service.createThread({
          taskId: 'task-1',
          title: 'Thread Title',
          content: 'Thread body',
          authorId: 1,
          isDeleted: false,
        }),
      /Task not found/,
    );
  });

  test('createThread rejects notification failure', async () => {
    db.thread = {
      create: async () => ({
        id: 'thread-1',
        title: 'Thread Title',
        content: 'Thread body',
        taskId: 'task-1',
        authorId: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Task',
        assignee: 2,
      }),
    };
    notificationService.createNotification = (async () => {
      throw new Error('notification failed');
    }) as unknown as (
      payload: CreateNotificationPayload,
    ) => Promise<NotificationDTO>;

    await assert.rejects(
      () =>
        service.createThread({
          taskId: 'task-1',
          title: 'Thread Title',
          content: 'Thread body',
          authorId: 1,
          isDeleted: false,
        }),
      /notification failed/,
    );
  });

  test('updateThread updates thread fields', async () => {
    let updateArgs: ThreadUpdateArgs | null = null;
    db.thread = {
      findUnique: async () => ({ id: 'thread-1' }),
      update: async (args: ThreadUpdateArgs) => {
        updateArgs = args;
        return {
          id: args.where.id,
          title: args.data.title,
          content: args.data.content,
          isDeleted: args.data.isDeleted,
        };
      },
    };

    await service.updateThread('thread-1', {
      taskId: 'task-1',
      title: 'Updated Thread',
      content: 'Updated',
      isDeleted: false,
    });

    assert.ok(updateArgs);
    const threadUpdateArgs = updateArgs as ThreadUpdateArgs;
    assert.equal(threadUpdateArgs.where.id, 'thread-1');
    assert.equal(threadUpdateArgs.data.title, 'Updated Thread');
  });

  test('updateThread rejects missing thread', async () => {
    db.thread = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () =>
        service.updateThread('thread-1', {
          taskId: 'task-1',
          title: 'Updated Thread',
          content: 'Updated',
          isDeleted: false,
        }),
      /Thread DNE/,
    );
  });

  test('updateThread rejects update failure', async () => {
    db.thread = {
      findUnique: async () => ({ id: 'thread-1' }),
      update: async () => {
        throw new Error('update failed');
      },
    };

    await assert.rejects(
      () =>
        service.updateThread('thread-1', {
          taskId: 'task-1',
          title: 'Updated Thread',
          content: 'Updated',
          isDeleted: false,
        }),
      /update failed/,
    );
  });

  test('deleteThread marks thread deleted', async () => {
    let updateArgs: ThreadUpdateArgs | null = null;
    db.thread = {
      findUnique: async () => ({ id: 'thread-1', taskId: 'task-1' }),
      update: async (args: ThreadUpdateArgs) => {
        updateArgs = args;
        return { id: args.where.id, isDeleted: args.data.isDeleted };
      },
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };

    await service.deleteThread('thread-1');

    assert.ok(updateArgs);
    const threadDeleteArgs = updateArgs as ThreadUpdateArgs;
    assert.equal(threadDeleteArgs.data.isDeleted, true);
  });

  test('deleteThread rejects missing thread', async () => {
    db.thread = {
      findUnique: async () => null,
    };

    await assert.rejects(() => service.deleteThread('thread-1'), /Thread DNE/);
  });

  test('deleteThread rejects update failure', async () => {
    db.thread = {
      findUnique: async () => ({ id: 'thread-1', taskId: 'task-1' }),
      update: async () => {
        throw new Error('update failed');
      },
    };

    await assert.rejects(
      () => service.deleteThread('thread-1'),
      /update failed/,
    );
  });

  test('createComment returns created comment', async () => {
    db.comment = {
      create: async (args: CommentCreateArgs) => ({
        id: 'comment-1',
        content: args.data.content,
        threadId: args.data.threadId,
        authorId: args.data.authorId,
        parentId: args.data.parentId ?? null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Task',
        assignee: 2,
      }),
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };
    db.user = {
      findUnique: async () => ({ id: 1, name: 'Author' }),
      findFirst: async () => null,
    };

    const comment = await service.createComment({
      taskId: 'task-1',
      threadId: 'thread-1',
      authorId: 1,
      content: 'Comment body',
      isDeleted: false,
      parentId: null,
    });

    assert.equal(comment.id, 'comment-1');
    assert.equal(comment.threadId, 'thread-1');
  });

  test('createComment rejects missing task', async () => {
    db.comment = {
      create: async () => ({
        id: 'comment-1',
        content: 'Comment body',
        threadId: 'thread-1',
        authorId: 1,
        parentId: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    db.task = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () =>
        service.createComment({
          taskId: 'task-1',
          threadId: 'thread-1',
          authorId: 1,
          content: 'Comment body',
          isDeleted: false,
          parentId: null,
        }),
      /Task not found/,
    );
  });

  test('createComment handles mention notification', async () => {
    const notifications: string[] = [];
    notificationService.createNotification = (async (
      payload: CreateNotificationPayload,
    ) => {
      notifications.push(payload.type);
      return {
        id: 'notif-1',
        type: payload.type,
        recipientId: 1,
        senderId: 2,
        taskId: payload.taskId ?? null,
        commentId: payload.commentId ?? null,
        threadId: payload.threadId ?? null,
        recipientName: 'Recipient',
        senderName: 'Sender',
        read: false,
      } as NotificationDTO;
    }) as unknown as (
      payload: CreateNotificationPayload,
    ) => Promise<NotificationDTO>;

    db.comment = {
      create: async () => ({
        id: 'comment-1',
        content: 'Hey @user@node.test',
        threadId: 'thread-1',
        authorId: 1,
        parentId: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Task',
        assignee: 2,
      }),
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };
    db.user = {
      findUnique: async () => ({ id: 1, name: 'Author' }),
      findFirst: async () => ({ id: 3, name: 'Mentioned' }),
    };

    await service.createComment({
      taskId: 'task-1',
      threadId: 'thread-1',
      authorId: 1,
      content: 'Hey @user@node.test',
      isDeleted: false,
      parentId: null,
    });

    assert.equal(notifications.length, 2);
  });

  test('createComment rejects notification failure', async () => {
    db.comment = {
      create: async () => ({
        id: 'comment-1',
        content: 'Comment body',
        threadId: 'thread-1',
        authorId: 1,
        parentId: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    db.task = {
      findUnique: async () => ({
        id: 'task-1',
        title: 'Task',
        assignee: 2,
      }),
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };
    db.user = {
      findUnique: async () => ({ id: 1, name: 'Author' }),
      findFirst: async () => null,
    };
    notificationService.createNotification = (async () => {
      throw new Error('notification failed');
    }) as unknown as (
      payload: CreateNotificationPayload,
    ) => Promise<NotificationDTO>;

    await assert.rejects(
      () =>
        service.createComment({
          taskId: 'task-1',
          threadId: 'thread-1',
          authorId: 1,
          content: 'Comment body',
          isDeleted: false,
          parentId: null,
        }),
      /notification failed/,
    );
  });

  test('updateComment updates comment', async () => {
    let updateArgs: CommentUpdateArgs | null = null;
    db.comment = {
      findUnique: async () => ({ id: 'comment-1' }),
      update: async (args: CommentUpdateArgs) => {
        updateArgs = args;
        return {
          id: args.where.id,
          content: args.data.content,
          isDeleted: args.data.isDeleted,
        };
      },
    };

    await service.updateComment('comment-1', {
      taskId: 'task-1',
      threadId: 'thread-1',
      content: 'Updated comment',
      isDeleted: false,
    });

    assert.ok(updateArgs);
    const commentUpdateArgs = updateArgs as CommentUpdateArgs;
    assert.equal(commentUpdateArgs.where.id, 'comment-1');
    assert.equal(commentUpdateArgs.data.content, 'Updated comment');
  });

  test('updateComment rejects missing comment', async () => {
    db.comment = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () =>
        service.updateComment('comment-1', {
          taskId: 'task-1',
          threadId: 'thread-1',
          content: 'Updated comment',
          isDeleted: false,
        }),
      /Comment DNE/,
    );
  });

  test('updateComment rejects update failure', async () => {
    db.comment = {
      findUnique: async () => ({ id: 'comment-1' }),
      update: async () => {
        throw new Error('update failed');
      },
    };

    await assert.rejects(
      () =>
        service.updateComment('comment-1', {
          taskId: 'task-1',
          threadId: 'thread-1',
          content: 'Updated comment',
          isDeleted: false,
        }),
      /update failed/,
    );
  });

  test('deleteComment marks comment deleted', async () => {
    let updateArgs: CommentUpdateArgs | null = null;
    db.comment = {
      findUnique: async () => ({ id: 'comment-1' }),
      update: async (args: CommentUpdateArgs) => {
        updateArgs = args;
        return { id: args.where.id, isDeleted: args.data.isDeleted };
      },
    };

    await service.deleteComment('comment-1', 'thread-1');

    assert.ok(updateArgs);
    const commentDeleteArgs = updateArgs as CommentUpdateArgs;
    assert.equal(commentDeleteArgs.data.isDeleted, true);
  });

  test('deleteComment rejects missing comment', async () => {
    db.comment = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () => service.deleteComment('comment-1', 'thread-1'),
      /Comment DNE/,
    );
  });

  test('deleteComment rejects update failure', async () => {
    db.comment = {
      findUnique: async () => ({ id: 'comment-1' }),
      update: async () => {
        throw new Error('update failed');
      },
    };

    await assert.rejects(
      () => service.deleteComment('comment-1', 'thread-1'),
      /update failed/,
    );
  });

  test('fetchComment returns dto', async () => {
    db.comment = {
      findUnique: async () => ({
        id: 'comment-1',
        content: 'Comment body',
        threadId: 'thread-1',
        authorId: 1,
        parentId: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [{ id: 'comment-2' }],
        author: { id: 1, name: 'Author' },
      }),
    };

    const comment = await service.fetchComment('comment-1');

    assert.equal(comment.id, 'comment-1');
    assert.equal(comment.authorName, 'Author');
    assert.equal(comment.replies[0], 'comment-2');
  });

  test('fetchComment rejects missing comment', async () => {
    db.comment = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () => service.fetchComment('comment-1'),
      /Comment DNE/,
    );
  });

  test('fetchComment rejects fetch failure', async () => {
    db.comment = {
      findUnique: async () => {
        throw new Error('fetch failed');
      },
    };

    await assert.rejects(
      () => service.fetchComment('comment-1'),
      /fetch failed/,
    );
  });

  test('fetchThread returns dto', async () => {
    db.thread = {
      findUnique: async () => ({
        id: 'thread-1',
        title: 'Thread Title',
        content: 'Thread body',
        taskId: 'task-1',
        authorId: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        comments: [{ id: 'comment-1', parentId: null }],
        author: { id: 1, name: 'Author' },
      }),
    };

    const thread = await service.fetchThread('thread-1');

    assert.equal(thread.id, 'thread-1');
    assert.equal(thread.authorName, 'Author');
    assert.equal(thread.comments[0], 'comment-1');
  });

  test('fetchThread rejects missing thread', async () => {
    db.thread = {
      findUnique: async () => null,
    };

    await assert.rejects(() => service.fetchThread('thread-1'), /Thread DNE/);
  });

  test('fetchThread rejects fetch failure', async () => {
    db.thread = {
      findUnique: async () => {
        throw new Error('fetch failed');
      },
    };

    await assert.rejects(() => service.fetchThread('thread-1'), /fetch failed/);
  });
});
