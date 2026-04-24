export interface UpdateScoreRequest {
  scoreA: number;
  scoreB: number;
  penaltyScoreA?: number;
  penaltyScoreB?: number;
  validatedBy: string;
  manOfTheMatchId?: string;
}
