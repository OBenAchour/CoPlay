import { StatutDemande } from "./StatutDemande";
import { RoleEquipe } from "./RoleEquipe";
export interface DemandeAdhesion {
  demandeId?: string;
  teamId:     string;
  userId:     string;
  proposedRole?: RoleEquipe;
  statut:     StatutDemande;
  createdAt?: string;
}
