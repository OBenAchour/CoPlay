import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  private apiUrl = 'http://localhost:8080/api/coaches';

  constructor(private http: HttpClient) { }

  proposerCoach(teamId: string, coachId: string): Observable<any> {
    const params = new HttpParams().set('teamId', teamId).set('coachId', coachId);
    return this.http.post(this.apiUrl, null, { params });
  }

  accepterProposition(propositionId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${propositionId}/accept`, null);
  }

  refuserProposition(propositionId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${propositionId}/refuse`, null);
  }
}
