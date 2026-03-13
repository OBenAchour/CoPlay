import { LikeTargetType } from "./LikeTargetType";
export interface Like {
  likeId?:    string;
  userId:     string;
  targetType: LikeTargetType;
  targetId:   string;
  createdAt?: string;
}