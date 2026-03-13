import { Competition } from "./Competition";
export interface Tournoi extends Competition {
  format?:       string;    // "SINGLE_ELIMINATION", etc.
  currentRound?: number;
  totalRounds?:  number;
}