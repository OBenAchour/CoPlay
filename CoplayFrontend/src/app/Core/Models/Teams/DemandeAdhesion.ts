import { StatutDemande } from "./StatutDemande";
export interface DemandeAdhesion {
  demandeId?: string;
  teamId:     string;
  userId:     string;
  statut:     StatutDemande;
  createdAt?: string;
}
