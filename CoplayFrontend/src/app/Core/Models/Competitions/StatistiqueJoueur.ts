export interface StatistiqueJoueur {
  id?: string;
  joueurId?: string;
  joueurNom?: string;
  competitionId: string;
  matchsJoues?: number;
  titularisations?: number;
  minutesJouees?: number;
  buts?: number;
  passesDecisives?: number;
  cartonsJaunes?: number;
  cartonsRouges?: number;
  penaltyMarques?: number;
  penaltyRates?: number;
  cleanSheets?: number;
  butsEncaisses?: number;
  elo?: number;
  etoiles?: number;
  points?: number;
}
