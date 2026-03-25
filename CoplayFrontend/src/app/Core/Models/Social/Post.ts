import { User } from "../Auth/User";
import {PostType} from "./PostType"
export interface Post {
  postId?:    string;
  author:   User;
  type:       PostType;
  content?:   string;
  photoUrl?:  string;
  eventRef?:  Event;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}