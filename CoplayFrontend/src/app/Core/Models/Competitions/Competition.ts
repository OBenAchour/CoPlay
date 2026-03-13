import { CompetitionStatus } from "./CompetitionStatus";
export interface Competition {
  competitionId?: string;
  name:           string;
  sport:          string;
  startDate?:     string;
  endDate?:       string;
  status?:        CompetitionStatus;
  maxTeams?:      number;
  createdBy?:     string;
  type?:          'TOURNOI' | 'LIGUE';  // discriminant
}