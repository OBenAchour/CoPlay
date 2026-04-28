import { StatutDemande } from "./StatutDemande";
import { RoleEquipe } from "./RoleEquipe";
export interface Invitation {
  invitationId?:  string;
  teamId:         string;
  teamName?:      string;
  invitedUserId:  string;
  invitedByUserId:string;
  proposedRole?:  RoleEquipe;
  statut:         StatutDemande;
  createdAt?:     string;
}