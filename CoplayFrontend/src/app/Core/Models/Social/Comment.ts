import { User } from "../Auth/User";

export interface Comment {
  commentId?:       string;
  postId:           string;
  author:         User;
  parentCommentId?: Comment;
  content:          string;
  createdAt?:       string;
  isDeleted?:       boolean;
}