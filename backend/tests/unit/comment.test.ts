import * as http from 'node:http';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';

import { CommentService } from '../../src/services/comment.service';
import { prisma } from '../../lib/prisma';
import type { PrismaClient } from '@prisma/client/extension';
import { notificationService } from '../../src/services/notification.service';
import { initWSServer, shutdownWSServer } from '../../src/websocket/ws.service';
import { NotifType } from '../../src/types/notifcation.types';

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
    notificationService.createNotification = (async () => ({
      id: 'notif-1',
      type: NotifType.COMMENT_ADDED,
    })) as any;
  });

  test('createThread returns created thread', async () => {
    db.thread = {
      create: async (args: any) => ({
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

  test('updateThread updates thread fields', async () => {
    let updateArgs: any = null;
    db.thread = {
      findUnique: async () => ({ id: 'thread-1' }),
      update: async (args: any) => {
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

    assert.equal(updateArgs?.where.id, 'thread-1');
    assert.equal(updateArgs?.data.title, 'Updated Thread');
  });

  test('deleteThread marks thread deleted', async () => {
    let updateArgs: any = null;
    db.thread = {
      findUnique: async () => ({ id: 'thread-1', taskId: 'task-1' }),
      update: async (args: any) => {
        updateArgs = args;
        return { id: args.where.id, isDeleted: args.data.isDeleted };
      },
    };
    db.activity = {
      create: async () => ({ id: 'activity-1' }),
    };

    await service.deleteThread('thread-1');

    assert.equal(updateArgs?.data.isDeleted, true);
  });

  test('createComment returns created comment', async () => {
    db.comment = {
      create: async (args: any) => ({
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

  test('updateComment updates comment', async () => {
    let updateArgs: any = null;
    db.comment = {
      findUnique: async () => ({ id: 'comment-1' }),
      update: async (args: any) => {
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

    assert.equal(updateArgs?.where.id, 'comment-1');
    assert.equal(updateArgs?.data.content, 'Updated comment');
  });

  test('deleteComment marks comment deleted', async () => {
    let updateArgs: any = null;
    db.comment = {
      findUnique: async () => ({ id: 'comment-1' }),
      update: async (args: any) => {
        updateArgs = args;
        return { id: args.where.id, isDeleted: args.data.isDeleted };
      },
    };

    await service.deleteComment('comment-1', 'thread-1');

    assert.equal(updateArgs?.data.isDeleted, true);
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
});
