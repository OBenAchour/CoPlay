import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DemandeAdhesion {
  demandeId?: string;
  teamId:     string;
  userId:     string;
  statut?:    'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class DemandeAdhesionService {

  private apiUrl = 'http://localhost:8080/api/demandes';

  constructor(private http: HttpClient) {}

  /** Soumettre une demande d'adhésion à une équipe */
  rejoindre(teamId: string, userId: string, proposedRole: string = 'PLAYER'): Observable<DemandeAdhesion> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('userId', userId)
      .set('proposedRole', proposedRole);
    return this.http.post<DemandeAdhesion>(`${this.apiUrl}/join`, null, { params });
  }

  // Récupère les demandes reçues pour une équipe
  getReceivedRequests(teamId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/team/${teamId}`);
  }

// Accepter une demande
  accepter(demandeId: string, captainId: string): Observable<any> {
    const params = new HttpParams().set('captainId', captainId);
    return this.http.put<any>(`${this.apiUrl}/accept/${demandeId}`, null, { params });
  }

// Refuser une demande
  refuser(demandeId: string, captainId: string): Observable<any> {
    const params = new HttpParams().set('captainId', captainId);
    return this.http.put<any>(`${this.apiUrl}/refuse/${demandeId}`, null, { params });
  }

  /** Récupérer mes demandes envoyées */
  getSentRequests(userId: string): Observable<DemandeAdhesion[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<DemandeAdhesion[]>(`${this.apiUrl}/my-demandes`, { params });
  }



}
