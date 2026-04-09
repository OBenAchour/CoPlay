import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CoplayEvent }         from 'src/app/Core/Models/Events & Training/CoplayEvent';
import { EventParticipation }  from 'src/app/Core/Models/Events & Training/EventParticipation';
import { EventStatus }         from 'src/app/Core/Models/Events & Training/EventStatus';
import { RSVPStatus }          from 'src/app/Core/Models/Events & Training/RSVPStatus';
import { ParticipationStatus } from 'src/app/Core/Models/Events & Training/ParticipationStatus';
import { PaymentStatus }       from 'src/app/Core/Models/Events & Training/PaymentStatus';
import { EventService }        from 'src/app/Core/Services/Events & Training/EventService/event-service.service';
import { LocationService }     from 'src/app/Core/Services/Events & Training/LocationService/location-service.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {

  event: CoplayEvent | null = null;
  participations: EventParticipation[] = [];
  userParticipation: EventParticipation | null = null;
  mapsLink = '';

  isLoading        = false;
  errorMessage     = '';
  isSubmittingRSVP = false;
  isCancelling     = false;
  rsvpError        = '';
  cancelError      = '';

  // ⚠️ Temporaire — sera remplacé après intégration Auth
  readonly teamId    = 'test-team-001';
  readonly userId    = 'test-user-001';
  readonly isCaptain = true;

  // Exposer les enums au template
  RSVPStatus          = RSVPStatus;
  EventStatus         = EventStatus;
  ParticipationStatus = ParticipationStatus;
  PaymentStatus       = PaymentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
    } else {
      this.errorMessage = 'Identifiant d\'événement manquant.';
    }
  }

  // ─── Chargement ─────────────────────────────────────────────────────────────

  private loadEvent(id: string): void {
    this.isLoading = true;

    // ✅ Charge directement par ID — plus efficace que charger toute la liste
    this.eventService.getEventById(id).subscribe({
      next: event => {
        this.event = event;
        this.loadParticipations(id);
        if (this.event.location?.locationId) {
          this.loadMapsLink(this.event.location.locationId);
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Événement introuvable.';
        this.isLoading = false;
      }
    });
  }

  private loadParticipations(eventId: string): void {
    this.eventService.getParticipations(eventId).subscribe({
      next: data => {
        this.participations    = data;
        // ✅ Cherche la participation du user courant
        this.userParticipation = data.find(
          p => (p.userId as any)?.userId === this.userId || p.userId === this.userId
        ) ?? null;
      },
      error: () => {}
    });
  }

  private loadMapsLink(locationId: string): void {
    this.locationService.getGoogleMapsLink(locationId).subscribe({
      next:  link => { this.mapsLink = link; },
      error: ()   => {}
    });
  }

  // ─── RSVP ───────────────────────────────────────────────────────────────────

  respondToEvent(status: RSVPStatus): void {
    if (!this.event?.eventId) return;
    this.isSubmittingRSVP = true;
    this.rsvpError        = '';

    this.eventService.respondToEvent(this.event.eventId, this.userId, status).subscribe({
      next: participation => {
        this.userParticipation = participation;
        this.isSubmittingRSVP  = false;
        // Recharger la liste des participations
        this.loadParticipations(this.event!.eventId!);
      },
      error: () => {
        this.rsvpError        = 'Erreur lors de la réponse à l\'événement.';
        this.isSubmittingRSVP = false;
      }
    });
  }

  // ─── Annulation ─────────────────────────────────────────────────────────────

  cancelEvent(): void {
    if (!this.event?.eventId) return;
    if (!confirm('Êtes-vous sûr de vouloir annuler cet événement ? Cette action est irréversible.')) return;

    this.isCancelling = true;
    this.cancelError  = '';

    this.eventService.cancelEvent(this.event.eventId).subscribe({
      next: () => {
        this.isCancelling = false;
        this.router.navigate(['/events']);
      },
      error: () => {
        this.cancelError  = 'Erreur lors de l\'annulation.';
        this.isCancelling = false;
      }
    });
  }

  // ─── Validation des présences ────────────────────────────────────────────────

  togglePresence(participation: EventParticipation, isPresent: boolean): void {
    if (!this.event?.eventId) return;

    // ✅ Extraire l'userId — peut être String ou objet User selon l'intégration
    const userId = typeof participation.userId === 'string'
      ? participation.userId
      : (participation.userId as any)?.userId ?? this.userId;

    this.eventService.validatePresence(this.event.eventId, userId, isPresent).subscribe({
      next: updated => {
        const idx = this.participations.findIndex(
          p => p.participationId === updated.participationId
        );
        if (idx !== -1) this.participations[idx] = updated;
      },
      error: () => {}
    });
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  goToEdit(): void {
    this.router.navigate(['/events/edit', this.event?.eventId]);
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  // ─── Helpers template ────────────────────────────────────────────────────────

  getStatusKey(status?: EventStatus): string {
    return status ? status.toLowerCase() : '';
  }

  getStatusClass(status?: EventStatus): string {
    switch (status) {
      case EventStatus.SCHEDULED: return 'status-scheduled';
      case EventStatus.ONGOING:   return 'status-ongoing';
      case EventStatus.COMPLETED: return 'status-completed';
      case EventStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status?: EventStatus): string {
    switch (status) {
      case EventStatus.SCHEDULED: return 'Planifié';
      case EventStatus.ONGOING:   return 'En cours';
      case EventStatus.COMPLETED: return 'Terminé';
      case EventStatus.CANCELLED: return 'Annulé';
      default: return '—';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getParticipationStatusLabel(status?: ParticipationStatus): string {
    switch (status) {
      case ParticipationStatus.CONFIRMED: return 'Confirmé';
      case ParticipationStatus.WAITING:   return 'En attente';
      case ParticipationStatus.DECLINED:  return 'Refusé';
      case ParticipationStatus.ABSENT:    return 'Absent';
      default: return '—';
    }
  }

  getParticipationStatusClass(status?: ParticipationStatus): string {
    switch (status) {
      case ParticipationStatus.CONFIRMED: return 'pstatus-confirmed';
      case ParticipationStatus.WAITING:   return 'pstatus-waiting';
      case ParticipationStatus.DECLINED:  return 'pstatus-declined';
      case ParticipationStatus.ABSENT:    return 'pstatus-absent';
      default: return '';
    }
  }

  getRSVPLabel(status?: RSVPStatus): string {
    switch (status) {
      case RSVPStatus.YES:     return '✅ Participation confirmée';
      case RSVPStatus.NO:      return '❌ Participation refusée';
      case RSVPStatus.PENDING: return '⏳ En attente de réponse';
      default: return '⏳ Pas encore répondu';
    }
  }

  // ─── Getters calculés ────────────────────────────────────────────────────────

  get confirmedParticipants(): EventParticipation[] {
    return this.participations.filter(
      p => p.participationStatus === ParticipationStatus.CONFIRMED
    );
  }

  get waitingParticipants(): EventParticipation[] {
    return this.participations.filter(
      p => p.participationStatus === ParticipationStatus.WAITING
    );
  }

  get isCompleted(): boolean {
    return this.event?.status === EventStatus.COMPLETED;
  }

  get isCancelled(): boolean {
    return this.event?.status === EventStatus.CANCELLED;
  }

  get canValidatePresences(): boolean {
    return this.isCaptain && this.isCompleted;
  }
}