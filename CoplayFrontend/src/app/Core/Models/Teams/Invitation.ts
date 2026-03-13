import { StatutDemande } from "./StatutDemande";
export interface Invitation {
  invitationId?:  string;
  teamId:         string;
  invitedUserId:  string;
  invitedByUserId:string;
  statut:         StatutDemande;
  createdAt?:     string;
}