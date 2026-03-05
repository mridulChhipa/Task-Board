export interface ThreadBody {
  title: string;
  content: string | null;
  authorId: number;
  isDeleted: boolean;
}

export interface UpdateThreadBody {
  title: string;
  content: string | null;
  isDeleted: boolean;
}

export interface CommentBody {
  threadId: string;
  authorId: number;
  content: string;
  isDeleted: boolean;
}

export interface UpdateCommentBody {
  threadId: string;
  content: string;
  isDeleted: boolean;
}