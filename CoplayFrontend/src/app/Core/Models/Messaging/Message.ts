import { User } from "../Auth/User";
import { Conversation } from "./Conversation";
import { MessageStatus } from "./MessageStatus";
import { MessageReaction } from "./MessageReaction";

export interface Message {
  messageId?:      string;
  sender?:         User;
  conversation:    Conversation;
  content:         string;
  status?:         MessageStatus;
  sentAt?:         string;
  isDeleted?:      boolean;
  isEdited?:       boolean;
  editedAt?:      string;
  reactions?:      MessageReaction[];
}