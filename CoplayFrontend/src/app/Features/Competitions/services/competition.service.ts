import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition } from '../../../Core/Models/Competitions/Competition';
import { MatchCompetition } from '../../../Core/Models/Competitions/MatchCompetition';
import { CreateCompetitionRequest } from '../../../Core/Models/Competitions/CreateCompetitionRequest';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = 'http://localhost:8080/api/competitions';

  constructor(private http: HttpClient) { }

  createCompetition(request: CreateCompetitionRequest): Observable<Competition> {
    return this.http.post<Competition>(this.apiUrl, request);
  }

  getCompetition(id: string): Observable<Competition> {
    return this.http.get<Competition>(`${this.apiUrl}/${id}`);
  }

  getAllCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.apiUrl);
  }

  getAllLeagues(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/league`);
  }

  getAllTournaments(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/tournament`);
  }

  generateCalendar(id: string, doubleLeg: boolean = true): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/generate-calendar?doubleLeg=${doubleLeg}`, {});
  }

  startCompetition(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/start`, {});
  }

  getCompetitionMatches(id: string): Observable<MatchCompetition[]> {
    return this.http.get<MatchCompetition[]>(`${this.apiUrl}/${id}/matches`);
  }

  getJourneeMatches(id: string, journee: number): Observable<MatchCompetition[]> {
    return this.http.get<MatchCompetition[]>(`${this.apiUrl}/${id}/journee/${journee}`);
  }
}
