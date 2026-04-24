import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMember } from '../../Core/Models/Teams/TeamMember';
import { RoleEquipe } from '../../Core/Models/Teams/RoleEquipe';
@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {

  private apiUrl = 'http://localhost:8081/api/teams';

  constructor(private http: HttpClient) {}

  // 🔹 Obtenir tous les membres d'une équipe
  getMembers(teamId: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/${teamId}/members`);
  }

  // 🔹 Ajouter un membre
  addMember(teamId: string, userId: string, role: RoleEquipe): Observable<TeamMember> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('role', role);

    return this.http.post<TeamMember>(`${this.apiUrl}/${teamId}/members`, {}, { params });
  }

  // 🔹 Supprimer un membre
  removeMember(teamId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }
}
