export interface HistoriqueAction {
  id?:          string;
  teamId:       string;
  actorId:      string;
  action:       string;
  performedAt?: string;
}