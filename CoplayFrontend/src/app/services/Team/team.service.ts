import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private apiUrl = 'http://localhost:8080/api/teams';

  constructor(private http: HttpClient) { }

  getAllTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getTeamById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /** NOUVEAU : Récupère une équipe avec ses membres (avec displayName, email, etc.) */
  getTeamDetail(teamId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detail/${teamId}`);
  }

  getTeamsByCreator(creatorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/creator/${creatorId}`);
  }

  createTeam(team: any, creatorId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?creatorId=${creatorId}`, team);
  }

  updateTeam(teamId: string, team: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${teamId}?currentUserId=${this.getCurrentUserId()}`, team);
  }

  deleteTeam(teamId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${teamId}?currentUserId=${this.getCurrentUserId()}`);
  }

  isCaptain(teamId: string, userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${teamId}/captain/${userId}`);
  }

  isMember(teamId: string, userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${teamId}/member/${userId}`);
  }

  getUserRole(teamId: string, userId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${teamId}/role/${userId}`);
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || '';
  }
}
