import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventStatus } from 'src/app/Core/Models/Events & Training/EventStatus';
import { EventParticipation } from 'src/app/Core/Models/Events & Training/EventParticipation';
import { RSVPStatus } from 'src/app/Core/Models/Events & Training/RSVPStatus';
import { CoplayEvent } from 'src/app/Core/Models/Events & Training/CoplayEvent';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  // ═══════════════════════════════════════════════════════════════
  //  ÉVÉNEMENTS
  // ═══════════════════════════════════════════════════════════════

  createEvent(event: any): Observable<CoplayEvent> {
    return this.http.post<CoplayEvent>(`${this.apiUrl}/add`, event);
  }

  updateEvent(eventId: string, event: any): Observable<CoplayEvent> {
    return this.http.put<CoplayEvent>(`${this.apiUrl}/update/${eventId}`, event);
  }

  cancelEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${eventId}`);
  }

  // ✅ NOUVEAU — charge un event directement par son ID
  getEventById(eventId: string): Observable<CoplayEvent> {
    return this.http.get<CoplayEvent>(`${this.apiUrl}/get/${eventId}`);
  }

  getEventsByTeam(teamId: string): Observable<CoplayEvent[]> {
    return this.http.get<CoplayEvent[]>(`${this.apiUrl}/get/team/${teamId}`);
  }

  getEventsByTeamAndStatus(teamId: string, status: EventStatus): Observable<CoplayEvent[]> {
    return this.http.get<CoplayEvent[]>(`${this.apiUrl}/get/team/${teamId}/status/${status}`);
  }

  getPublicEvents(): Observable<CoplayEvent[]> {
    return this.http.get<CoplayEvent[]>(`${this.apiUrl}/get/public`);
  }

  // ═══════════════════════════════════════════════════════════════
  //  RSVP
  // ═══════════════════════════════════════════════════════════════

  respondToEvent(
    eventId: string,
    userId: string,
    status: RSVPStatus,
    attendanceScore: number = 50
  ): Observable<EventParticipation> {
    return this.http.post<EventParticipation>(
      `${this.apiUrl}/rsvp/add/${eventId}/${userId}?status=${status}&attendanceScore=${attendanceScore}`,
      {}
    );
  }

  getParticipations(eventId: string): Observable<EventParticipation[]> {
    return this.http.get<EventParticipation[]>(
      `${this.apiUrl}/participations/get/${eventId}`
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  PAIEMENT
  // ═══════════════════════════════════════════════════════════════

  confirmPayment(eventId: string, userId: string): Observable<EventParticipation> {
    return this.http.put<EventParticipation>(
      `${this.apiUrl}/payment/confirm/${eventId}/${userId}`,
      {}
    );
  }

  getAllEvents(): Observable<CoplayEvent[]> {
  return this.http.get<CoplayEvent[]>(`${this.apiUrl}/all`);
}

  // ═══════════════════════════════════════════════════════════════
  //  VALIDATION DES PRÉSENCES
  // ═══════════════════════════════════════════════════════════════

  validatePresence(
    eventId: string,
    userId: string,
    isPresent: boolean
  ): Observable<EventParticipation> {
    return this.http.put<EventParticipation>(
      `${this.apiUrl}/presence/update/${eventId}/${userId}?isPresent=${isPresent}`,
      {}
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  STATS ASSIDUITÉ
  // ═══════════════════════════════════════════════════════════════

  // ✅ NOUVEAU : Mettre à jour uniquement le statut d'un event
updateEventStatus(eventId: string, status: string): Observable<CoplayEvent> {
  return this.http.put<CoplayEvent>(
    `${this.apiUrl}/update/${eventId}/status?status=${status}`,
    {}
  );
}

  getAttendanceRate(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/attendance/${userId}`);
  }
}