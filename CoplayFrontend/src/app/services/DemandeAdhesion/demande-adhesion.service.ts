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
  rejoindre(teamId: string, userId: string): Observable<DemandeAdhesion> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('userId', userId);
    return this.http.post<DemandeAdhesion>(`${this.apiUrl}/join`, null, { params });
  }

  /** Accepter une demande (admin/capitaine) */
  accepter(demandeId: string, adminId: string): Observable<DemandeAdhesion> {
    const params = new HttpParams().set('adminId', adminId);
    return this.http.put<DemandeAdhesion>(`${this.apiUrl}/accept/${demandeId}`, null, { params });
  }
}
