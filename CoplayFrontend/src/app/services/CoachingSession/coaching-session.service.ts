import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface CoachingSession {
  sessionId?: string;
  coachId: string;
  athleteId: string;
  programId?: string;
  linkedServiceId?: string;
  scheduledAt: string;
  duration?: number;
  status: SessionStatus;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class CoachingSessionService {

  private apiUrl = 'http://localhost:8080/api/coaching-sessions';

  constructor(private http: HttpClient) { }

  schedule(coachId: string, athleteId: string, scheduledAt: string,
           opts: { programId?: string; duration?: number } = {}
          ): Observable<CoachingSession> {
    let params = new HttpParams()
      .set('coachId', coachId)
      .set('athleteId', athleteId)
      .set('scheduledAt', scheduledAt);
    if (opts.programId) params = params.set('programId', opts.programId);
    if (opts.duration != null) params = params.set('duration', String(opts.duration));
    return this.http.post<CoachingSession>(this.apiUrl, null, { params });
  }

  linkService(sessionId: string, marketplaceServiceId: string): Observable<CoachingSession> {
    const params = new HttpParams().set('marketplaceServiceId', marketplaceServiceId);
    return this.http.patch<CoachingSession>(`${this.apiUrl}/${sessionId}/link-service`, null, { params });
  }

  complete(sessionId: string, notes?: string): Observable<CoachingSession> {
    let params = new HttpParams();
    if (notes) params = params.set('notes', notes);
    return this.http.patch<CoachingSession>(`${this.apiUrl}/${sessionId}/complete`, null, { params });
  }

  cancel(sessionId: string): Observable<CoachingSession> {
    return this.http.patch<CoachingSession>(`${this.apiUrl}/${sessionId}/cancel`, null);
  }

  byCoach(coachId: string): Observable<CoachingSession[]> {
    return this.http.get<CoachingSession[]>(`${this.apiUrl}/coach/${coachId}`);
  }

  byAthlete(athleteId: string): Observable<CoachingSession[]> {
    return this.http.get<CoachingSession[]>(`${this.apiUrl}/athlete/${athleteId}`);
  }
}
