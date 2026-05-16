import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ProgressMetric = 'WEIGHT' | 'REPS' | 'TIME_SECONDS' | 'DISTANCE_METERS' | 'HEART_RATE';

export interface AthleteProgress {
  progressId?: string;
  athleteId: string;
  programId: string;
  exerciseId: string;
  coachId?: string;
  metric: ProgressMetric;
  value: number;
  recordedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {

  private apiUrl = 'http://localhost:8080/api/progress';

  constructor(private http: HttpClient) { }

  record(p: AthleteProgress): Observable<AthleteProgress> {
    let params = new HttpParams()
      .set('athleteId', p.athleteId)
      .set('programId', p.programId)
      .set('exerciseId', p.exerciseId)
      .set('metric', p.metric)
      .set('value', String(p.value));
    if (p.coachId) params = params.set('coachId', p.coachId);
    return this.http.post<AthleteProgress>(this.apiUrl, null, { params });
  }

  history(athleteId: string): Observable<AthleteProgress[]> {
    return this.http.get<AthleteProgress[]>(`${this.apiUrl}/athlete/${athleteId}`);
  }

  programHistory(athleteId: string, programId: string): Observable<AthleteProgress[]> {
    return this.http.get<AthleteProgress[]>(`${this.apiUrl}/athlete/${athleteId}/program/${programId}`);
  }

  averages(athleteId: string, programId: string): Observable<Record<ProgressMetric, number>> {
    return this.http.get<Record<ProgressMetric, number>>(
      `${this.apiUrl}/athlete/${athleteId}/program/${programId}/averages`
    );
  }
}
