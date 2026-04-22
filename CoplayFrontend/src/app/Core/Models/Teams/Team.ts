import { TeamStatus } from "./TeamStatus";
export interface Team {
  teamId?:      string;
  name:         string;
  sport:        string;
  city?:        string;
  description?: string;
  capacityMax?: number;
  status?:      TeamStatus;
  creatorId?:  string; // ← AJOUTE

}
