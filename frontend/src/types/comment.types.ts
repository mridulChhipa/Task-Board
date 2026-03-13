export interface ThreadDTO {
  id: string;
  title: string;
  content: string | null;
  authorId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  comments: string[];
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
  replies: string[];
}