import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type InjurySeverity = 'MILD' | 'MODERATE' | 'SEVERE';
export type InjuryStatus = 'ACTIVE' | 'HEALED';

export interface Injury {
  injuryId?: string;
  athleteId: string;
  reportedByCoachId?: string;
  bodyPart: string;
  severity: InjurySeverity;
  status: InjuryStatus;
  startDate?: string;
  expectedRecovery?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class InjuryService {

  private apiUrl = 'http://localhost:8080/api/injuries';

  constructor(private http: HttpClient) { }

  report(athleteId: string,
         bodyPart: string,
         severity: InjurySeverity,
         opts: { reportedByCoachId?: string; startDate?: string; expectedRecovery?: string; notes?: string } = {}
        ): Observable<Injury> {
    let params = new HttpParams()
      .set('athleteId', athleteId)
      .set('bodyPart', bodyPart)
      .set('severity', severity);
    if (opts.reportedByCoachId) params = params.set('reportedByCoachId', opts.reportedByCoachId);
    if (opts.startDate) params = params.set('startDate', opts.startDate);
    if (opts.expectedRecovery) params = params.set('expectedRecovery', opts.expectedRecovery);
    if (opts.notes) params = params.set('notes', opts.notes);
    return this.http.post<Injury>(this.apiUrl, null, { params });
  }

  heal(injuryId: string): Observable<Injury> {
    return this.http.patch<Injury>(`${this.apiUrl}/${injuryId}/heal`, null);
  }

  listAll(athleteId: string): Observable<Injury[]> {
    return this.http.get<Injury[]>(`${this.apiUrl}/athlete/${athleteId}`);
  }

  listActive(athleteId: string): Observable<Injury[]> {
    return this.http.get<Injury[]>(`${this.apiUrl}/athlete/${athleteId}/active`);
  }

  isAvailable(athleteId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/athlete/${athleteId}/available`);
  }
}
