import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from 'src/app/Core/Models/Teams/Team'; // adapte le chemin si besoin

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private apiUrl = 'http://localhost:8081/api/teams';

  constructor(private http: HttpClient) {
  }

  // 🔹 GET ALL TEAMS
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  // 🔹 GET TEAM BY ID
  getTeamById(teamId: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${teamId}`);
  }

  // 🔹 CREATE TEAM
  createTeam(team: Team, creatorId: string): Observable<Team> {
    const params = new HttpParams().set('creatorId', creatorId);

    return this.http.post<Team>(this.apiUrl, team, {params});
  }

  // ✅ UPDATE
  updateTeam(id: string, team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, team);
  }

  // ✅ DELETE
  deleteTeam(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
