import { Competition } from "./Competition";
export interface Ligue extends Competition {
  pointsVictoire?: number;
  pointsNul?:      number;
  pointsDefaite?:  number;
  nbJournees?:     number;
}