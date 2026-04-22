import { ConversationType } from "./ConversationType";

export interface ConversationListItem {
  conversationId: string;
  type: ConversationType;
  name: string;
  otherUserId?: string;
  otherUserAvatar?: string;
  lastMessageContent?: string;
  lastMessageTime?: string;  
  unreadCount?: number;
}