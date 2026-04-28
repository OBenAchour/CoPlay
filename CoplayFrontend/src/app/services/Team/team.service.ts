import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Injectable({ providedIn: 'root' })
export class TeamService {

  private apiUrl = 'http://localhost:8081/api/teams';

  constructor(private http: HttpClient) {}

  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeamById(teamId: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${teamId}`);
  }

  getMyTeams(creatorId: string): Observable<Team[]> {
    const params = new HttpParams().set('creatorId', creatorId);
    return this.http.get<Team[]>(`${this.apiUrl}/my-teams`, { params });
  }

  createTeam(team: Partial<Team>, creatorId: string): Observable<Team> {
    const params = new HttpParams().set('creatorId', creatorId);
    return this.http.post<Team>(this.apiUrl, team, { params });
  }

  updateTeam(id: string, team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, team);
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
