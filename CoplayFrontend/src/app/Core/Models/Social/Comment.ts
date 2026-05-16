import { User } from "../Auth/User";

export interface Comment {
  commentId: string;
  author: User;
  content: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}
