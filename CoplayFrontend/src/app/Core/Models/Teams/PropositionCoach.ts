import { StatutDemande } from "./StatutDemande";
export interface PropositionCoach {
  propositionId?: string;
  teamId:         string;
  coachId:        string;
  statut:         StatutDemande;
  createdAt?:     string;
}