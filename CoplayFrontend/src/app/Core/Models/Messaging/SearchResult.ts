import { User } from '../Auth/User';

export interface SearchResult {
  messageId: string;
  conversationId: string;
  conversationName: string;
  sender: User;
  content: string;
  sentAt: string;
  matchedText: string;
  matchPosition: number;
}