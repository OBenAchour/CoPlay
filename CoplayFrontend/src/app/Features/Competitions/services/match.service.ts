import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatchCompetition } from '../../../Core/Models/Competitions/MatchCompetition';
import { UpdateScoreRequest } from '../../../Core/Models/Competitions/UpdateScoreRequest';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:8080/api/matches';

  constructor(private http: HttpClient) { }

  getMatch(id: string): Observable<MatchCompetition> {
    return this.http.get<MatchCompetition>(`${this.apiUrl}/${id}`);
  }

  getMatchEvents(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/events`);
  }

  addMatchEvent(id: string, event: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/events`, event);
  }

  updateMatchScore(id: string, request: UpdateScoreRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/score`, request);
  }

  addPenaltyScores(id: string, penaltyScoreA: number, penaltyScoreB: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/penalty?penaltyScoreA=${penaltyScoreA}&penaltyScoreB=${penaltyScoreB}`, {});
  }

  getCompetitionMatches(competitionId: string): Observable<MatchCompetition[]> {
    return this.http.get<MatchCompetition[]>(`${this.apiUrl}/competition/${competitionId}`);
  }

  updateMatchStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
}
