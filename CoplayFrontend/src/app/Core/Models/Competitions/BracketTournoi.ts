export interface BracketTournoi {
  id?: string;
  competitionId: string;
  round: number;
  phase: string;
  matchIds?: string[];
  dateLimite?: string;
  estComplete?: boolean;
  estTire?: boolean;
}
