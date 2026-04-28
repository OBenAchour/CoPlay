import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMember } from 'src/app/Core/Models/Teams/TeamMember';
import { RoleEquipe } from 'src/app/Core/Models/Teams/RoleEquipe';

@Injectable({ providedIn: 'root' })
export class TeamMemberService {

  private apiUrl = 'http://localhost:8081/api/teams';

  constructor(private http: HttpClient) {}

  getMembers(teamId: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/${teamId}/members`);
  }

  addMember(teamId: string, userId: string, role: RoleEquipe): Observable<TeamMember> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('role', role);
    return this.http.post<TeamMember>(`${this.apiUrl}/${teamId}/members`, null, { params });
  }

  removeMember(teamId: string, userId: string, captainId: string): Observable<void> {
    const params = new HttpParams().set('captainId', captainId);
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${userId}`, { params });
  }

  isCaptain(teamId: string, userId: string): Observable<boolean> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<boolean>(`${this.apiUrl}/${teamId}/members/is-captain`, { params });
  }
}
