import { User } from "../Auth/User";
import { CoplayEvent } from "../Events & Training/CoplayEvent";
import { PostType } from "./PostType";

export interface Post {
  postId?:        string;
  author:         User;
  type:           PostType;
  content?:       string;
  photoUrl?:      string;
  eventRef?:      CoplayEvent;
  createdAt?:     string;
  updatedAt?:     string;
  isDeleted?:     boolean;
  likeCount?:     number;
  commentCount?:  number;
  isLiked?:       boolean;
}