import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipeSponsor } from 'src/app/Core/Models/Teams/EquipeSponsor';

@Injectable({ providedIn: 'root' })
export class EquipeSponsorService {

  private apiUrl = 'http://localhost:8081/api/sponsors';

  constructor(private http: HttpClient) {}

  getSponsors(teamId: string): Observable<EquipeSponsor[]> {
    return this.http.get<EquipeSponsor[]>(`${this.apiUrl}/team/${teamId}`);
  }

  addSponsor(teamId: string, captainId: string, sponsorName: string, logoUrl: string, link: string): Observable<EquipeSponsor> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('captainId', captainId)
      .set('sponsorName', sponsorName)
      .set('logoUrl', logoUrl)
      .set('link', link);
    return this.http.post<EquipeSponsor>(this.apiUrl, null, { params });
  }

  removeSponsor(sponsorId: string, captainId: string, teamId: string): Observable<void> {
    const params = new HttpParams()
      .set('captainId', captainId)
      .set('teamId', teamId);
    return this.http.delete<void>(`${this.apiUrl}/${sponsorId}`, { params });
  }
}
