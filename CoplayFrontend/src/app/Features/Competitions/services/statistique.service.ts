import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { switchMap, takeWhile, tap, catchError, map, expand, take } from 'rxjs/operators';

export interface JobStatusResponse {
  job_id: string;
  status: string;
  progress: number;
}

export interface JobResultResponse {
  job_id: string;
  status: string;
  summary?: any;
  video?: any;
  detections?: any;
  output_video_url?: string;
  processing_time_seconds?: number;
}


@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private apiUrl = 'http://localhost:8080/api/statistiques';
  private predictionApiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  /* ═══════════════════════════════════════════
     Spring Boot API (port 8080)
     ═══════════════════════════════════════════ */

  getTopScorers(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-scorers?competitionId=${competitionId}`);
  }

  getClassement(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/competitions/${competitionId}/classement`);
  }

  getBestPlayers(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/best-players?competitionId=${competitionId}`);
  }

  getTopStars(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-stars?competitionId=${competitionId}`);
  }

  getTopPassers(competitionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-passers?competitionId=${competitionId}`);
  }

  /* ═══════════════════════════════════════════
     Python AI API (port 5000)
     ═══════════════════════════════════════════ */

  analyzeVideo(data: any): Observable<any> {
    const formData = new FormData();

    // REQUIRED fields (must match Flask exactly)
    formData.append('video', data.file);
    formData.append('team_1', data.team_1 || 'Team 1');
    formData.append('team_2', data.team_2 || 'Team 2');

    // OPTIONAL color fields — only append if non-empty
    const c1 = (data.team1_color || '').replace('#', '').trim();
    const c2 = (data.team2_color || '').replace('#', '').trim();
    const gk1 = (data.gk_team1_color || '').replace('#', '').trim();
    const gk2 = (data.gk_team2_color || '').replace('#', '').trim();

    if (c1) formData.append('team1_color', c1);
    if (c2) formData.append('team2_color', c2);
    if (gk1) formData.append('gk_team1_color', gk1);
    if (gk2) formData.append('gk_team2_color', gk2);

    return this.http.post(`${this.predictionApiUrl}/analyze/video`, formData);
  }

  getJobStatus(jobId: string): Observable<any> {
    return this.http.get(`${this.predictionApiUrl}/analyze/status/${jobId}`);
  }

  getJobResult(jobId: string): Observable<any> {
    return this.http.get(`${this.predictionApiUrl}/analyze/result/${jobId}`);
  }

  pollJobUntilComplete(jobId: string): Observable<any> {
    return timer(0, 3000).pipe(
      switchMap(() => this.getJobStatus(jobId)),
      takeWhile(status => status.status === 'processing' || status.status === 'queued', true),
      tap(status => {
        if (status.status === 'failed') throw new Error('Analysis failed');
      })
    );
  }

  getDownloadUrl(jobId: string): string {
    return `${this.predictionApiUrl}/download/${jobId}`;
  }

  /* ═══════════════════════════════════════════
     Competition Statistics Logic
     ═══════════════════════════════════════════ */

  getStatistics(competitionId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/competitions/statistics?competitionId=${competitionId}`);
  }

  updateStatistics(matchId: string, scoreData: { scoreA: number, scoreB: number }): Observable<any> {
    return this.http.put(`http://localhost:8080/api/competitions/statistics/update?matchId=${matchId}`, scoreData);
  }

  getMatchDetails(matchId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/competitions/match/${matchId}`);
  }

  saveMatchStatistics(matchId: string, data: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/competitions/match/${matchId}/statistics`, data);
  }
}
