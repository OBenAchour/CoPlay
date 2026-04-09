export interface CreateConversationRequest {
  type: 'DIRECT' | 'GROUP' | 'TEAM';
  name?: string;
  participantIds: string[];
  description?: string;
}