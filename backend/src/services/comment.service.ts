import { error } from 'node:console';
import { db } from '../config/db';
import type {
  CommentBody,
  CommentDTO,
  ThreadBody,
  ThreadDTO,
  UpdateCommentBody,
  UpdateThreadBody,
} from '../types/comment.types';
// import { NotifType } from '../types/notifcation.types';
import { toCommentDTO, toThreadDTO } from '../utils/comment.utils';
// import { notifcationService } from './notification.service';

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

        // await notifcationService.createNotification({
        //   taskId,
        //   type: NotifType.THREAD_STARTED,
        //   senderId: authorId,
        //   userId: recId,
        //   commentId: null,
        //   threadId: createdThread.id,
        // });
      }

      return createdThread as ThreadDTO;
    } catch (error) {
      throw new Error('Error creating thread: ', { cause: error });
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
    } catch (error) {
      throw new Error('Error creating thread: ', { cause: error });
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
      throw new Error('Error deleting thread: ', { cause: error });
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
      console.log(
        '=============Creating Comment with content: \n',
        content,
        '\n=======================',
      );
      const createdComment = await db.comment.create({
        data: {
          threadId,
          authorId,
          content,
          parentId,
        },
      });

      if (createdComment) {
        console.log(createdComment);
        await db.activity.create({
          data: {
            type: 'COMMENT_ADDED',
            commentId: createdComment.id,
            taskId: taskId,
            userId: authorId,
          },
        });

        // await notifcationService.createNotification({
        //   taskId,
        //   type: NotifType.COMMENT_ADDED,
        //   senderId: authorId,
        //   userId: recId,
        //   commentId: createdComment.id,
        //   threadId: null,
        // });
      }

      return createdComment as CommentDTO;
    } catch (error) {
      console.log(error);
      throw new Error('Error creating comment: ', { cause: error });
    }
  }

  async updateComment(
    id: string,
    { content, isDeleted, threadId }: UpdateCommentBody,
  ): Promise<void> {
    try {
      console.log(id, threadId, content, isDeleted);
      const existingComment = await db.comment.findUnique({
        where: {
          id,
          // threadId,
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
          // threadId,
        },
      });
    } catch (error) {
      throw new Error('Error updating comment: ', { cause: error });
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
    } catch (error) {
      console.log(error);
      throw new Error('Error deleting comment: ', { cause: error });
    }
  }

  async fetchComment(id: string): Promise<CommentDTO> {
    try {
      // console.log("Fetching: ", id);
      const existingComment = await db.comment.findUnique({
        where: {
          id,
        },
        include: {
          replies: true,
        },
      });

      // console.log("Existing: ", existingComment);

      if (!existingComment) {
        throw new Error();
      }

      return toCommentDTO(existingComment);
    } catch (err) {
      throw new Error("Can't fetch comment: ", { cause: err });
    }
  }

  async fetchThread(id: string): Promise<ThreadDTO> {
    try {
      const existingThread = await db.thread.findUnique({
        where: {
          id,
        },
        include: {
          comments: true,
        },
      });

      if (!existingThread) {
        throw new Error();
      }
      return toThreadDTO(existingThread);
    } catch (err) {
      throw new Error("Can't fetch thread: ", { cause: err });
    }
  }
}

export const commentService = new CommentService();
