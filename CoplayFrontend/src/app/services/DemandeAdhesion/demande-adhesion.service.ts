import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemandeAdhesion } from 'src/app/Core/Models/Teams/DemandeAdhesion';

@Injectable({ providedIn: 'root' })
export class DemandeAdhesionService {

  private apiUrl = 'http://localhost:8081/api/demandes';

  constructor(private http: HttpClient) {}

  rejoindreEquipe(teamId: string, userId: string): Observable<DemandeAdhesion> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('userId', userId);
    return this.http.post<DemandeAdhesion>(`${this.apiUrl}/join`, null, { params });
  }

  getMyDemandes(userId: string): Observable<DemandeAdhesion[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<DemandeAdhesion[]>(`${this.apiUrl}/my-demandes`, { params });
  }

  getDemandesByTeam(teamId: string): Observable<DemandeAdhesion[]> {
    return this.http.get<DemandeAdhesion[]>(`${this.apiUrl}/team/${teamId}`);
  }

  accepterDemande(demandeId: string, adminId: string): Observable<DemandeAdhesion> {
    const params = new HttpParams().set('adminId', adminId);
    return this.http.put<DemandeAdhesion>(`${this.apiUrl}/accept/${demandeId}`, null, { params });
  }

  refuserDemande(demandeId: string, adminId: string): Observable<DemandeAdhesion> {
    const params = new HttpParams().set('adminId', adminId);
    return this.http.put<DemandeAdhesion>(`${this.apiUrl}/refuse/${demandeId}`, null, { params });
  }
}
