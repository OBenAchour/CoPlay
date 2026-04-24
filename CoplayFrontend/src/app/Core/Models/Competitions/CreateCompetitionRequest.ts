import { CompetitionType } from "./CompetitionType";

export interface CreateCompetitionRequest {
  name: string;
  sport: string;
  type: CompetitionType;
  startDate: string;
  endDate?: string;
  maxTeams?: number;
  teamIds?: string[];
  doubleLeg?: boolean;
}
