import { User } from "../Auth/User";
import { LikeTargetType } from "./LikeTargetType";
import { Post } from "./Post";
import { Comment } from "./Comment";

export interface Like {
  likeId?:      string;
  user:         User;
  targetType:   LikeTargetType;
  post?:        Post;
  comment?:     Comment;
  createdAt?:   string;
}