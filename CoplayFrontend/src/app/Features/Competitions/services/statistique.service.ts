import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatistiqueJoueur } from '../../../Core/Models/Competitions/StatistiqueJoueur';
import { ExtraStats } from '../../../Core/Models/Competitions/ExtraStats';
import { ResultatTournoi } from '../../../Core/Models/Competitions/ResultatTournoi';

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private apiUrl = 'http://localhost:8080/api/statistiques';

  constructor(private http: HttpClient) { }

  getClassement(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competition/${competitionId}/classement`);
  }

  getEquipeStats(equipeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipe/${equipeId}`);
  }

  getEquipeStatsForCompetition(equipeId: string, competitionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/equipe/${equipeId}/competition/${competitionId}`);
  }

  getTopScorers(competitionId: string): Observable<StatistiqueJoueur[]> {
    return this.http.get<StatistiqueJoueur[]>(`${this.apiUrl}/competition/${competitionId}/top-scorers`);
  }

  getTopPassers(competitionId: string): Observable<StatistiqueJoueur[]> {
    return this.http.get<StatistiqueJoueur[]>(`${this.apiUrl}/competition/${competitionId}/top-passers`);
  }

  getBestGoalkeepers(competitionId: string): Observable<StatistiqueJoueur[]> {
    return this.http.get<StatistiqueJoueur[]>(`${this.apiUrl}/competition/${competitionId}/best-goalkeepers`);
  }

  getBestPlayers(competitionId: string): Observable<StatistiqueJoueur[]> {
    return this.http.get<StatistiqueJoueur[]>(`${this.apiUrl}/competition/${competitionId}/best-players`);
  }

  getTopStars(competitionId: string): Observable<StatistiqueJoueur[]> {
    return this.http.get<StatistiqueJoueur[]>(`${this.apiUrl}/competition/${competitionId}/top-stars`);
  }

  getExtraStats(competitionId: string): Observable<ExtraStats> {
    return this.http.get<ExtraStats>(`${this.apiUrl}/competition/${competitionId}/extras`);
  }

  getCurrentJournee(competitionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/competition/${competitionId}/journee`);
  }

  getPlayerStats(playerId: string, competitionId: string): Observable<StatistiqueJoueur> {
    return this.http.get<StatistiqueJoueur>(`${this.apiUrl}/joueur/${playerId}/competition/${competitionId}`);
  }

  getTournoiClassement(competitionId: string): Observable<ResultatTournoi[]> {
    return this.http.get<ResultatTournoi[]>(`${this.apiUrl}/competition/${competitionId}/tournoi/classement`);
  }
}
