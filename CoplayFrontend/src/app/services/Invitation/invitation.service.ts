import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invitation } from 'src/app/Core/Models/Teams/Invitation';

@Injectable({ providedIn: 'root' })
export class InvitationService {

  private apiUrl = 'http://localhost:8081/api/invitations';

  constructor(private http: HttpClient) {}

  // Capitaine — envoyer invitation
  inviterUser(teamId: string, invitedUserId: string, captainId: string): Observable<Invitation> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('invitedUserId', invitedUserId)
      .set('captainId', captainId);
    return this.http.post<Invitation>(this.apiUrl, null, { params });
  }

  // Joueur — mes invitations reçues
  getMyInvitations(userId: string): Observable<Invitation[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Invitation[]>(`${this.apiUrl}/my-invitations`, { params });
  }

  // Capitaine — invitations envoyées par équipe
  getInvitationsByTeam(teamId: string): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.apiUrl}/team/${teamId}`);
  }

  // Joueur — accepter
  accepterInvitation(invitationId: string): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.apiUrl}/accept/${invitationId}`, null);
  }

  // Joueur — refuser
  refuserInvitation(invitationId: string): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.apiUrl}/refuse/${invitationId}`, null);
  }
}
