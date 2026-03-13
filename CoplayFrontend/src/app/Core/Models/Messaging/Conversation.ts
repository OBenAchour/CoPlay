import { ConversationType } from "./ConversationType";

export interface Conversation {
  conversationId?: string;
  type:            ConversationType;
  name?:           string;
  createdAt?:      string;
  updatedAt?:      string;
  isArchived?:     boolean;
}