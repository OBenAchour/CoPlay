import { Message } from './Message';
import { User } from '../Auth/User';
import { ReactionType } from './ReactionType';

export interface MessageReaction {
  reactionId?: string;
  message: Message;
  user: User;
  reactionType: ReactionType;
  createdAt?: string;
  updatedAt?: string;
}