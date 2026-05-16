import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatchCompetition } from '../../../Core/Models/Competitions/MatchCompetition';
import { UpdateScoreRequest } from '../../../Core/Models/Competitions/UpdateScoreRequest';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  // URL de base pour les matchs standards
  private apiUrl = 'http://localhost:8080/api/matches';
  // URL spécifique pour les opérations de compétition (Controller Competition)
  private competitionApiUrl = 'http://localhost:8080/api/competitions';

  constructor(private http: HttpClient) { }

  getAllMatches(): Observable<MatchCompetition[]> {
    return this.http.get<MatchCompetition[]>(this.apiUrl);
  }

  getMatch(id: string): Observable<MatchCompetition> {
    return this.http.get<MatchCompetition>(`${this.apiUrl}/${id}`);
  }

  getMatchEvents(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/events`);
  }

  addMatchEvent(id: string, event: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/events`, event);
  }

  /**
   * CORRIGÉ : Mise à jour du score avec 3 arguments
   * @param id ID du match
   * @param request Objet contenant scoreA et scoreB
   * @param userId ID de l'utilisateur (Admin ou Capitaine) pour le Header
   */
  updateMatchScore(id: string, request: UpdateScoreRequest, userId: string): Observable<any> {
  const httpOptions = {
    headers: new HttpHeaders({
      'user-id': userId // Assure-toi que c'est en minuscule 'user-id'
    })
  };

  // URL corrigée pour correspondre au MatchController.java (@PutMapping)
  const url = `${this.apiUrl}/${id}/score`; 
  
  return this.http.put(url, request, httpOptions); // Utilise PUT ici
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

  createMatchRequest(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, request);
  }

  acceptMatchRequest(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/accept`, {});
  }

  declineMatchRequest(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/decline`, {});
  }

  submitCaptainScore(id: string, scoreData: { scoreA: number, scoreB: number, captainSide: 'A' | 'B' }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/submit-score`, scoreData);
  }

  adminValidateMatch(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/validate`, {});
  }
}