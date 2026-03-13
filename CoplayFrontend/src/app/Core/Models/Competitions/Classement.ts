export interface Classement {
  id?:            string;
  competitionId:  string;
  teamId:         string;
  points?:        number;
  goalsFor?:      number;
  goalsAgainst?:  number;
  goalDifference?:number;
  rank?:          number;
}