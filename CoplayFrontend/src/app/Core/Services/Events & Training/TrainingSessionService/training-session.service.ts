import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainingSession, TrainingSessionRequest } from 'src/app/Core/Models/Events & Training/TrainingSession';

@Injectable({
  providedIn: 'root'
})
export class TrainingSessionService {

  private baseUrl = 'http://localhost:8080/api/training-sessions';

  constructor(private http: HttpClient) {}

  /** Crée une nouvelle séance d'entraînement. */
  createSession(session: TrainingSessionRequest): Observable<TrainingSession> {
    return this.http.post<TrainingSession>(`${this.baseUrl}/add`, session);
  }

  /** Toutes les séances. */
  getAllSessions(): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(`${this.baseUrl}/all`);
  }

  /** Une séance par son ID. */
  getSessionById(sessionId: string): Observable<TrainingSession> {
    return this.http.get<TrainingSession>(`${this.baseUrl}/get/${sessionId}`);
  }

  /** Toutes les séances d'une équipe. */
  getSessionsByTeam(teamId: string): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(`${this.baseUrl}/get/team/${teamId}`);
  }

  /** Séances à venir d'une équipe (calendrier). */
  getUpcomingByTeam(teamId: string): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(`${this.baseUrl}/get/team/${teamId}/upcoming`);
  }

  /** Modifie une séance. */
  updateSession(sessionId: string, session: TrainingSessionRequest): Observable<TrainingSession> {
    return this.http.put<TrainingSession>(`${this.baseUrl}/update/${sessionId}`, session);
  }

  /** Annule une séance. */
  cancelSession(sessionId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/cancel/${sessionId}`, {});
  }

  /** Marque une séance comme COMPLETED. */
  completeSession(sessionId: string): Observable<TrainingSession> {
    return this.http.put<TrainingSession>(`${this.baseUrl}/complete/${sessionId}`, {});
  }

  /** Supprime une séance. */
  deleteSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${sessionId}`);
  }
}