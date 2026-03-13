import { ParticipantRole } from "./ParticipantRole";
export interface Participant {
  participantId?: string;
  conversationId: string;
  userId:         string;
  role:           ParticipantRole;
  joinedAt?:      string;
  lastReadAt?:    string;
  isActive?:      boolean;
}