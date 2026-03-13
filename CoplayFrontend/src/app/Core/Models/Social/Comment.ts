export interface Comment {
  commentId?:       string;
  postId:           string;
  authorId:         string;
  parentCommentId?: string;
  content:          string;
  createdAt?:       string;
  isDeleted?:       boolean;
}