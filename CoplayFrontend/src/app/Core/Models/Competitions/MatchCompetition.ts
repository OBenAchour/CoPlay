import { MatchStatus } from "./MatchStatus";
export interface MatchCompetition {
  id?:            string;
  competitionId:  string;
  teamAId:        string;
  teamBId:        string;
  dateMatch?:     string;
  scoreTeamA?:    number;
  scoreTeamB?:    number;
  status?:        MatchStatus;
  isValidated?:   boolean;
  validatedBy?:   string;
  validatedAt?:   string;
}