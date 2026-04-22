import { ConversationType } from "./ConversationType";
import { Participant } from "./Participant";
import { Message } from "./Message";

export interface Conversation {
  conversationId?: string;
  type: ConversationType;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  isArchived?: boolean;
  participants?: Participant[];
  lastMessage?: Message;
  unreadCount?: number;
}