import { User } from "../Auth/User";
import { LikeTargetType } from "./LikeTargetType";
import { Post } from "./Post";
export interface Like {
  likeId?:    string;
  user:     User;
  targetType: LikeTargetType;
  post : Post;
  comment : Comment;
  createdAt?: string;
}