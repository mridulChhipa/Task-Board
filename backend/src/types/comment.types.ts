export interface ThreadBody {
  taskId: string;
  title: string;
  content: string | null;
  authorId: number;
  isDeleted: boolean;
}

export interface UpdateThreadBody {
  taskId: string;
  title: string;
  content: string | null;
  isDeleted: boolean;
}

export interface CommentBody {
  taskId: string;
  threadId: string;
  authorId: number;
  content: string;
  isDeleted: boolean;
  parentId: string | null;
}

export interface UpdateCommentBody {
  taskId: string;
  threadId: string;
  content: string;
  isDeleted: boolean;
}

export interface CommentDTO {
  id: string;
  content: string;
  threadId: string;
  authorId: number;
  isDeleted: boolean;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  authorName: string;
  replies: string[];
}

export interface ThreadDTO {
  id: string;
  title: string;
  content: string | null;
  authorId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  authorName: string;
  comments: string[];
}
