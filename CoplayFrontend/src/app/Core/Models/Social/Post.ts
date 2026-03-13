import {PostType} from "./PostType"
export interface Post {
  postId?:    string;
  authorId:   string;
  type:       PostType;
  content?:   string;
  photoUrl?:  string;
  eventRef?:  string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}