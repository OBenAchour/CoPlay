import { User } from "../Auth/User";
import { Conversation } from "./Conversation";
import { ParticipantRole } from "./ParticipantRole";
export interface Participant {
  participantId?: string;
  conversation: Conversation;
  user:         User;
  role:           ParticipantRole;
  joinedAt?:      string;
  lastReadAt?:    string;
  isActive?:      boolean;
}