export interface ResultatTournoi {
  id?: string;
  competitionId: string;
  equipeId: string;
  equipeNom?: string;
  positionFinale?: number;
  matchsJoues?: number;
  victoires?: number;
  defaites?: number;
  nuls?: number;
  butsPour?: number;
  butsContre?: number;
  penaltiesGagnes?: number;
  penaltiesPerdus?: number;
  estElimine?: boolean;
  eliminatedAtRound?: string;
}
