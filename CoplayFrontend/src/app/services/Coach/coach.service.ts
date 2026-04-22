import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropositionCoach } from 'src/app/Core/Models/Teams/PropositionCoach';

@Injectable({ providedIn: 'root' })
export class CoachService {

  private apiUrl = 'http://localhost:8081/api/coaches';

  constructor(private http: HttpClient) {}

  // Capitaine — proposer un coach
  proposerCoach(teamId: string, coachId: string): Observable<PropositionCoach> {
    const params = new HttpParams()
      .set('teamId', teamId)
      .set('coachId', coachId);
    return this.http.post<PropositionCoach>(this.apiUrl, null, { params });
  }

  // Voir propositions reçues (côté coach)
  getMesPropositions(coachId: string): Observable<PropositionCoach[]> {
    const params = new HttpParams().set('coachId', coachId);

    return this.http.get<PropositionCoach[]>(
      `http://localhost:8081/api/coaches/my-propositions`,
      { params }
    );
  }


  // Voir propositions envoyées (côté capitaine)
  getPropositionsByTeam(teamId: string): Observable<PropositionCoach[]> {
    return this.http.get<PropositionCoach[]>(`${this.apiUrl}/team/${teamId}`);
  }

  // Coach — accepter
  accepterProposition(propositionId: string): Observable<PropositionCoach> {
    return this.http.put<PropositionCoach>(`${this.apiUrl}/accept/${propositionId}`, null);
  }

  // Coach — refuser
  refuserProposition(propositionId: string): Observable<PropositionCoach> {
    return this.http.put<PropositionCoach>(`${this.apiUrl}/refuse/${propositionId}`, null);
  }
}
