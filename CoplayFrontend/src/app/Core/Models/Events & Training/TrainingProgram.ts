import { Exercise } from "./Exercise";
export interface TrainingProgram {
  programId?: string;
  teamId:     string;
  title:      string;
  level?:     string;
  duration?:  number;         // en minutes
  exercises?: Exercise[];     // embedded
}