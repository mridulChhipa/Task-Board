import { db } from '../config/db';
import type {
  CommentBody,
  CommentDTO,
  ThreadBody,
  ThreadDTO,
  UpdateCommentBody,
  UpdateThreadBody,
} from '../types/comment.types';
import { NotifType } from '../types/notifcation.types';
import {
  extractEmailMentions,
  toCommentDTO,
  toThreadDTO,
} from '../utils/comment.utils';
import { notificationService } from './notification.service';
import { sendNotif } from '../websocket/ws.service';

export class CommentService {
  async createThread({
    title,
    authorId,
    content,
    taskId,
  }: ThreadBody): Promise<ThreadDTO> {
    try {
      const createdThread = await db.thread.create({
        data: {
          title,
          authorId,
          content,
          taskId: taskId,
        },
      });

      if (createdThread) {
        await db.activity.create({
          data: {
            type: 'THREAD_ADDED',
            threadId: createdThread.id,
            taskId: taskId,
            userId: authorId,
          },
        });

        const task = await db.task.findUnique({
          where: {
            id: taskId,
          },
        });

        if (!task) {
          throw new Error('Task not found');
        }

        await notificationService.createNotification({
          recipientId: task.assignee,
          senderId: authorId,
          taskId: taskId,
          commentId: null,
          threadId: createdThread.id,
          type: NotifType.THREAD_STARTED,
        });

        sendNotif(
          authorId,
          task.assignee,
          `New thread started on task: ${task.title}`,
        );
      }

      return createdThread as ThreadDTO;
    } catch (error) {
      throw error;
    }
  }

  async updateThread(
    id: string,
    { title, content, isDeleted }: UpdateThreadBody,
  ): Promise<void> {
    try {
      const existingThread = await db.thread.findUnique({
        where: {
          id,
        },
      });

      if (!existingThread) {
        throw new Error('Thread DNE');
      }

      await db.thread.update({
        data: {
          title,
          isDeleted,
          content,
        },
        where: {
          id,
        },
      });
      
      await db.activity.create({
        data: {
          type: 'THREAD_EDITED',
          threadId: id,
          taskId: existingThread.taskId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteThread(id: string): Promise<void> {
    try {
      const existingThread = await db.thread.findUnique({
        where: {
          id,
        },
      });

      if (!existingThread) {
        throw new Error('Thread DNE');
      }

      await db.thread.update({
        where: {
          id,
        },
        data: {
          isDeleted: true,
        },
      });

      await db.activity.create({
        data: {
          type: 'THREAD_DELETED',
          threadId: id,
          taskId: existingThread.taskId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createComment({
    threadId,
    authorId,
    content,
    taskId,
    parentId,
  }: CommentBody): Promise<CommentDTO> {
    try {
      const createdComment = await db.comment.create({
        data: {
          threadId,
          authorId,
          content,
          parentId,
        },
      });

      const task = await db.task.findUnique({
        where: {
          id: taskId,
        },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (createdComment) {
        await db.activity.create({
          data: {
            type: 'COMMENT_ADDED',
            commentId: createdComment.id,
            taskId: taskId,
            userId: authorId,
          },
        });

        await notificationService.createNotification({
          taskId,
          type: NotifType.COMMENT_ADDED,
          senderId: authorId,
          recipientId: task.assignee,
          commentId: createdComment.id,
          threadId: createdComment.threadId,
        });

        const mentions: string[] = extractEmailMentions(createdComment.content);

        console.log(mentions);

        const author = await db.user.findUnique({
          where: {
            id: authorId,
          },
        });

        for (const mention of mentions) {
          const normalizedEmail = mention.startsWith('@')
            ? mention.slice(1)
            : mention;
          console.log('Mentioned: ', normalizedEmail);
          const user = await db.user.findFirst({
            where: {
              email: {
                equals: normalizedEmail,
                mode: 'insensitive',
              },
            },
          });

          if (user) {
            const createdNotification =
              await notificationService.createNotification({
                recipientId: user.id,
                senderId: authorId,
                taskId: taskId,
                type: NotifType.MENTIONED,
                commentId: createdComment.id,
                threadId: threadId,
              });

            sendNotif(
              authorId,
              user.id,
              `${createdNotification.type}: You were mentioned in a comment on task: ${task.title} by ${author?.name}`,
            );
          }
        }

        sendNotif(
          authorId,
          task.assignee,
          `New comment added to task: ${task.title}`,
        );
      }

      return createdComment as CommentDTO;
    } catch (error) {
      throw error;
    }
  }

  async updateComment(
    id: string,
    { content, isDeleted }: UpdateCommentBody,
  ): Promise<void> {
    try {
      const existingComment = await db.comment.findUnique({
        where: {
          id,
        },
      });

      if (!existingComment) {
        throw new Error('Comment DNE');
      }

      await db.comment.update({
        data: {
          isDeleted,
          content,
        },
        where: {
          id,
        },
      });

      await db.activity.create({
        data: {
          type: 'COMMENT_EDITED',
          commentId: id,
          taskId: existingComment.threadId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(id: string, threadId: string): Promise<void> {
    void threadId;
    try {
      const existingComment = await db.comment.findUnique({
        where: {
          id,
        },
      });

      if (!existingComment) {
        throw new Error('Comment DNE');
      }

      await db.comment.update({
        data: {
          isDeleted: true,
        },
        where: {
          id,
        },
      });

      await db.activity.create({
        data: {
          type: 'COMMENT_DELETED',
          commentId: id,
          taskId: existingComment.threadId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async fetchComment(id: string): Promise<CommentDTO> {
    try {
      const existingComment = await db.comment.findUnique({
        where: {
          id,
        },
        include: {
          replies: true,
          author: true,
        },
      });

      if (!existingComment) {
        throw new Error("Comment DNE");
      }

      return toCommentDTO(existingComment);
    } catch (err) {
      throw err;
    }
  }

  async fetchThread(id: string): Promise<ThreadDTO> {
    try {
      const existingThread = await db.thread.findUnique({
        where: {
          id,
        },
        include: {
          comments: {
            where: {
              parentId: null,
            },
          },
          author: true,
        },
      });

      if (!existingThread) {
        throw new Error("Thread DNE");
      }
      return toThreadDTO(existingThread);
    } catch (err) {
      throw err;
    }
  }
}

export const commentService = new CommentService();
