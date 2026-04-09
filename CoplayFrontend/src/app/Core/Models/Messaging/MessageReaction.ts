import { ReactionType } from './ReactionType';

export interface MessageReaction {
  reactionId?: string;
  message?: any;
  user: any;
  reactionType: ReactionType;
  createdAt?: string;
  updatedAt?: string;
}