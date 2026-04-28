import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemandeAdhesion } from 'src/app/Core/Models/Teams/DemandeAdhesion';

@Injectable({ providedIn: 'root' })
export class DemandeAdhesionService {

  private apiUrl = 'http://localhost:8081/api/demandes';

  constructor(private http: HttpClient) {}

  rejoindreEquipe(teamId: string, userId: string, proposedRole: string): Observable<DemandeAdhesion> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('userId', userId)
      .set('proposedRole', proposedRole);
    return this.http.post<DemandeAdhesion>(`${this.apiUrl}/join`, null, { params });
  }

  getMyDemandes(userId: string): Observable<DemandeAdhesion[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<DemandeAdhesion[]>(`${this.apiUrl}/my-demandes`, { params });
  }

  getDemandesByTeam(teamId: string, captainId: string): Observable<DemandeAdhesion[]> {
    const params = new HttpParams().set('captainId', captainId);
    return this.http.get<DemandeAdhesion[]>(`${this.apiUrl}/team/${teamId}`, { params });
  }

  deleteDemande(demandeId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${demandeId}`);
  }

  accepterDemande(demandeId: string, captainId: string): Observable<DemandeAdhesion> {
    const params = new HttpParams().set('captainId', captainId);
    return this.http.put<DemandeAdhesion>(`${this.apiUrl}/accept/${demandeId}`, null, { params });
  }

  refuserDemande(demandeId: string, captainId: string): Observable<DemandeAdhesion> {
    const params = new HttpParams().set('captainId', captainId);
    return this.http.put<DemandeAdhesion>(`${this.apiUrl}/refuse/${demandeId}`, null, { params });
  }
}
