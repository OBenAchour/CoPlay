import { MatchStatus } from "./MatchStatus";
import { Team } from "../Teams/Team"; // Assure-toi d'importer ton modèle Team

export interface MatchCompetition {
  id?: string;
  competitionId?: string; // Correspond à la DBRef vers Competition
  
  // Mapping exact avec le backend Java
  equipeA: Team;          
  equipeB: Team;          
  
  numeroJournee: number;  // LE CHAMP CRUCIAL pour tes rounds
  
  dateMatch?: string;
  scoreA?: number;        // Changé de scoreTeamA à scoreA
  scoreB?: number;        // Changé de scoreTeamB à scoreB
  
  status?: MatchStatus;
  isValidated?: boolean;

  // Optionnel : Penalty si c'est un tournoi plus tard
  penaltyScoreA?: number;
  penaltyScoreB?: number;
}