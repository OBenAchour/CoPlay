import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Ticket,
  CreateTicketsRequest,
  BuyTicketRequest
} from '../Core/Models/Competitions/Ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  // Générer les tickets d'un match (admin)
  generateTickets(matchId: string,
                  request: CreateTicketsRequest): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(
      `${this.apiUrl}/match/${matchId}/generate`, request);
  }

  // Tous les tickets d'un match
  getMatchTickets(matchId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/match/${matchId}`);
  }

  // Tickets disponibles seulement
  getAvailableTickets(matchId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(
      `${this.apiUrl}/match/${matchId}/available`);
  }

  // ✅ CORRIGÉ : envoie buyerEmail
  buyTicket(request: BuyTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/buy`, request);
  }

  // ✅ CORRIGÉ : utilise l'email encodé dans l'URL
  getMyTickets(email: string): Observable<Ticket[]> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<Ticket[]>(
      `${this.apiUrl}/my-tickets/${encodedEmail}`);
  }
}