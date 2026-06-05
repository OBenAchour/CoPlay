import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ← INTERFACE COMPLÈTE
export interface Invitation {
  invitationId: string;
  teamId: string;
  teamName: string;
  teamSport?: string;
  invitedUserId: string;
  invitedByUserId: string;
  proposedRole: string;
  statut: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  private apiUrl = 'http://localhost:8080/api/invitations';

  constructor(private http: HttpClient) { }

  inviter(teamId: string, invitedUserId: string, captainId: string, role: string = 'PLAYER'): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?teamId=${teamId}&invitedUserId=${invitedUserId}&captainId=${captainId}&role=${role}`,
      {}
    );
  }

  getSentInvitations(teamId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sent/${teamId}`);
  }

  getReceivedInvitations(): Observable<Invitation[]> {
    const userId = localStorage.getItem('userId') || '';
    return this.http.get<Invitation[]>(`${this.apiUrl}/received?userId=${userId}`);
  }
  acceptInvitation(invitationId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${invitationId}/accept`, {});
  }

  rejectInvitation(invitationId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${invitationId}/reject`, {});
  }

  deleteInvitation(invitationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${invitationId}`);
  }
}
