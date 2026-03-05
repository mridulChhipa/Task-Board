import { db } from "../config/db";
import type { CommentBody, ThreadBody, UpdateCommentBody, UpdateThreadBody } from "../types/comment.types";

export class CommentService {
  async createThread({ title, authorId, content }: ThreadBody): Promise<void> {
    try {
      await db.thread.create({
        data: {
          title,
          authorId,
          content,
        },
      });
    } catch (error) {
      throw new Error("Error creating thread: ", { cause: error });
    }
  }

  async updateThread(id: string, { title, content, isDeleted }: UpdateThreadBody): Promise<void> {
    try {
      const existingThread = db.thread.findUnique({
        where: {
          id,
        }
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
        }
      });
    } catch (error) {
      throw new Error("Error creating thread: ", { cause: error });
    }
  }
  async deleteThread(id: string): Promise<void> {
    try {
      const existingThread = db.thread.findUnique({
        where: {
          id,
        }
      });

      if (!existingThread) {
        throw new Error('Thread DNE');
      }

      await db.thread.delete({
        where: {
          id,
        }
      });
    } catch (error) {
      throw new Error("Error deleting thread: ", { cause: error });
    }
  }

  async createComment({ threadId, authorId, content }: CommentBody): Promise<void> {
    try {
      await db.comment.create({
        data: {
          threadId,
          authorId,
          content,
        },
      });
    } catch (error) {
      throw new Error("Error creating thread: ", { cause: error });
    }
  }

  async updateComment(id: string, { content, isDeleted, threadId }: UpdateCommentBody): Promise<void> {
    try {
      const existingComment = db.comment.findUnique({
        where: {
          id,
          threadId,
        }
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
          threadId,
        }
      });
    } catch (error) {
      throw new Error("Error updating comment: ", { cause: error });
    }
  }

  async deleteComment(id: string, { threadId }: UpdateCommentBody): Promise<void> {
    try {
      const existingComment = db.comment.findUnique({
        where: {
          id,
          threadId,
        }
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
          threadId,
        }
      });
    } catch (error) {
      throw new Error("Error deleting comment: ", { cause: error });
    }
  }
}

export const commentService = new CommentService();
