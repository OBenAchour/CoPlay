import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Invitation {
  invitationId?:    string;
  teamId:           string;
  invitedUserId:    string;
  invitedByUserId?: string;
  statut?:          'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  createdAt?:       string;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {

  private apiUrl = 'http://localhost:8080/api/invitations';

  constructor(private http: HttpClient) {}

  /** Inviter un joueur dans une équipe */
  inviter(teamId: string, invitedUserId: string, captainId: string): Observable<Invitation> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('invitedUserId', invitedUserId)
      .set('captainId', captainId);
    return this.http.post<Invitation>(this.apiUrl, null, { params });
  }
}
