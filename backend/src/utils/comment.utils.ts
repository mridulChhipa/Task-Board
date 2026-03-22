import type { Prisma } from '../../generated/prisma/client';
import type { CommentDTO, ThreadDTO } from '../types/comment.types';

type CommentWithChildren = Prisma.CommentGetPayload<{
  include: {
    replies: true;
    author: true;
  };
}>;

export function toCommentDTO(comment: CommentWithChildren): CommentDTO {
  const repIds = [];
  for (const reply of comment.replies) {
    repIds.push(reply.id);
  }

  return {
    id: comment.id,
    content: comment.content,
    parentId: comment.parentId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    isDeleted: comment.isDeleted,
    threadId: comment.threadId ?? '',
    authorId: comment.authorId,
    replies: repIds,
    authorName: comment.author.name,
  };
}
type ThreadWithChildren = Prisma.ThreadGetPayload<{
  include: {
    comments: true;
    author: true;
  };
}>;

export function toThreadDTO(thread: ThreadWithChildren): ThreadDTO {
  const cmnts = [];
  for (const cmnt of thread.comments) {
    cmnts.push(cmnt.id);
  }

  return {
    id: thread.id,
    title: thread.title,
    content: thread.content,
    taskId: thread.taskId,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    isDeleted: thread.isDeleted,
    authorId: thread.authorId,
    comments: cmnts,
    authorName: thread.author.name,
  };
}

export const extractEmailMentions = (text: string): string[] => {
  const mentionRegex = /@[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(mentionRegex);

  return matches ? [...new Set(matches)] : [];
};
