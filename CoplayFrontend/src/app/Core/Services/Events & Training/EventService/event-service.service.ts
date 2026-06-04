import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EventStatus } from 'src/app/Core/Models/Events & Training/EventStatus';
import { EventParticipation } from 'src/app/Core/Models/Events & Training/EventParticipation';
import { RSVPStatus } from 'src/app/Core/Models/Events & Training/RSVPStatus';
import { CoplayEvent } from 'src/app/Core/Models/Events & Training/CoplayEvent';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = 'http://localhost:8080/api/events';
  private usersUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Récupère l'utilisateur connecté.
   * Nécessaire car l'userId n'est PAS présent dans la réponse de login
   * ni dans le JWT (qui ne porte que l'email dans `sub`). Les composants
   * du module Events l'utilisent pour RSVP / paiement / présences.
   * GET /api/users/me
   */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.usersUrl}/me`);
  }

  /**
   * Normalise un événement reçu du backend.
   * Le backend stocke le lieu sous la clé `locationId` (objet Location complet),
   * alors que l'UI (carte, détail) lit `event.location`. On recopie donc
   * `locationId` → `location` pour que la localisation s'affiche correctement.
   */
  private normalizeEvent = (event: any): CoplayEvent => {
    if (event && !event.location && event.locationId && typeof event.locationId === 'object') {
      event.location = event.locationId;
    }
    return event as CoplayEvent;
  };

  private normalizeEvents = (events: any[]): CoplayEvent[] =>
    (events || []).map(this.normalizeEvent);

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
    return this.http.get<CoplayEvent>(`${this.apiUrl}/get/${eventId}`).pipe(map(this.normalizeEvent));
  }

  getEventsByTeam(teamId: string): Observable<CoplayEvent[]> {
    return this.http.get<CoplayEvent[]>(`${this.apiUrl}/get/team/${teamId}`).pipe(map(this.normalizeEvents));
  }

  getEventsByTeamAndStatus(teamId: string, status: EventStatus): Observable<CoplayEvent[]> {
    return this.http.get<CoplayEvent[]>(`${this.apiUrl}/get/team/${teamId}/status/${status}`).pipe(map(this.normalizeEvents));
  }

  getPublicEvents(): Observable<CoplayEvent[]> {
    return this.http.get<CoplayEvent[]>(`${this.apiUrl}/get/public`).pipe(map(this.normalizeEvents));
  }

  // ═══════════════════════════════════════════════════════════════
  //  RSVP
  // ═══════════════════════════════════════════════════════════════

  respondToEvent(
    eventId: string,
    userId: string,
    status: RSVPStatus
  ): Observable<EventParticipation> {
    return this.http.post<EventParticipation>(
      `${this.apiUrl}/rsvp/add/${eventId}/${userId}?status=${status}`,
      {}
    );
  }

  getParticipations(eventId: string): Observable<EventParticipation[]> {
    return this.http.get<EventParticipation[]>(`${this.apiUrl}/participations/get/${eventId}`);
  }

  /**
   * Annule la participation (RSVP) du joueur à un événement.
   * DELETE /api/events/rsvp/delete/{eventId}/{userId}
   */
  cancelRsvp(eventId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rsvp/delete/${eventId}/${userId}`);
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

  /**
   * Initie un paiement Flouci → renvoie l'URL de la page de paiement (link) + paymentId.
   * POST /payment/initiate/{eventId}/{userId}
   */
  initiateFlouciPayment(eventId: string, userId: string): Observable<{ link: string; paymentId: string }> {
    return this.http.post<{ link: string; paymentId: string }>(
      `${this.apiUrl}/payment/initiate/${eventId}/${userId}`,
      {}
    );
  }

  /**
   * Vérifie le paiement Flouci au retour et finalise (PAID).
   * PUT /payment/verify/{eventId}/{userId}
   */
  verifyFlouciPayment(eventId: string, userId: string): Observable<EventParticipation> {
    return this.http.put<EventParticipation>(
      `${this.apiUrl}/payment/verify/${eventId}/${userId}`,
      {}
    );
  }

  getAllEvents(): Observable<CoplayEvent[]> {
  return this.http.get<CoplayEvent[]>(`${this.apiUrl}/all`).pipe(map(this.normalizeEvents));
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