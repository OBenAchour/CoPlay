export interface StatistiqueEquipe {
  id?:            string;
  teamId:         string;
  competitionId:  string;
  matchsJoues?:   number;
  victoires?:     number;
  defaites?:      number;
  nuls?:          number;
  butsMarques?:   number;
  butsEncaisses?: number;
}