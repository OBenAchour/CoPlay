import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // ═════════ AUTH HEADERS ═════════
  private getAuthHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ═════════ CREATE (ADMIN ONLY) ═════════
  createCompetition(request: CreateCompetitionRequest): Observable<Competition> {
    return this.http.post<Competition>(
      `${this.apiUrl}/create`,
      request,
      this.getAuthHeaders()
    );
  }

  // ═════════ GET ONE ═════════
  getCompetition(id: string): Observable<Competition> {
    return this.http.get<Competition>(`${this.apiUrl}/${id}`);
  }

  // ═════════ GET ALL ═════════
  getAllCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.apiUrl);
  }

  // ═════════ FILTERED LISTS (OPTIONAL BACKEND) ═════════
  getAllLeagues(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/league`);
  }

  getAllTournaments(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.apiUrl}/tournament`);
  }

  // ═════════ DELETE (ADMIN / CREATOR) ═════════
  deleteCompetition(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    );
  }

  // ═════════ JOIN (COACH / CAPTAIN) ═════════
  joinCompetition(id: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/join`,
      {},
      this.getAuthHeaders()
    );
  }

  // ═════════ CALENDAR ═════════
  generateCalendar(id: string, doubleLeg: boolean = true): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/generate-calendar?doubleLeg=${doubleLeg}`,
      {},
      this.getAuthHeaders()
    );
  }

  // ═════════ START COMPETITION ═════════
  startCompetition(id: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/start`,
      {},
      this.getAuthHeaders()
    );
  }

  // ═════════ MATCHES ═════════
  getCompetitionMatches(id: string): Observable<MatchCompetition[]> {
    return this.http.get<MatchCompetition[]>(
      `${this.apiUrl}/${id}/matches`
    );
  }

  getJourneeMatches(id: string, journee: number): Observable<MatchCompetition[]> {
    return this.http.get<MatchCompetition[]>(
      `${this.apiUrl}/${id}/journee/${journee}`
    );
  }
}