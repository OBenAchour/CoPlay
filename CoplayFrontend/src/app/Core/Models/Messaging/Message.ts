import { MessageStatus } from "./MessageStatus";
export interface Message {
  messageId?:      string;
  senderId:        string;
  conversationId:  string;
  content:         string;
  status?:         MessageStatus;
  sentAt?:         string;
  isDeleted?:      boolean;
}