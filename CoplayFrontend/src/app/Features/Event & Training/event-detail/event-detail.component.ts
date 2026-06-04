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
import { AuthService }         from 'src/app/Core/Services/Auth/auth.service';

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
  userAttendanceRate: number | null = null;  // ✅ NOUVEAU
  currentUserId = '';                          // ✅ chargé via /api/users/me

  isLoading        = false;
  errorMessage     = '';
  isSubmittingRSVP = false;
  isCancelling     = false;
  rsvpError        = '';
  cancelError      = '';
  isChangingStatus = false;
  statusError      = '';
  isPaying         = false;   // ✅ paiement en cours
  payError         = '';
  isCancellingRsvp = false;   // ✅ annulation participation en cours
  cancelRsvpError  = '';

  // Exposer les enums au template
  RSVPStatus          = RSVPStatus;
  EventStatus         = EventStatus;
  ParticipationStatus = ParticipationStatus;
  PaymentStatus       = PaymentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private locationService: LocationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Identifiant d\'événement manquant.';
      return;
    }

    // L'userId n'est ni dans le login ni dans le JWT → on le récupère via /me,
    // puis on charge l'événement et les participations (matching correct).
    this.eventService.getCurrentUser().subscribe({
      next: (u) => { this.currentUserId = u?.userId || u?.id || ''; this.initData(id); },
      error: () => { this.currentUserId = this.authService.getUserId(); this.initData(id); }
    });
  }

  private initData(id: string): void {
    this.loadEvent(id);
    this.loadUserAttendanceRate();
    this.handleFlouciReturn(id);  // ✅ retour de paiement Flouci
  }

  // ─── Getters Auth ───────────────────────────────────────────────────────────

  get isAdmin(): boolean      { return this.authService.isAdmin(); }
  get userId():  string       { return this.currentUserId || this.authService.getUserId(); }

  /** True if current user can manage this event (organizer or admin) */
  get canManageEvent(): boolean {
    const uid = this.userId;
    return this.isAdmin || (!!uid && !!this.event?.organizerId && this.event.organizerId === uid);
  }

  get userRole(): string | null {
    return this.authService.getUserRole();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // ─── Statuts ────────────────────────────────────────────────────────────────

  getAvailableStatuses(): { value: string; label: string }[] {
    const current = this.event?.status;
    
    const allStatuses = [
      { value: 'SCHEDULED', label: '📅 Planifié' },
      { value: 'ONGOING',   label: '▶️ En cours' },
      { value: 'COMPLETED', label: '✅ Terminé' },
      { value: 'CANCELLED', label: '❌ Annulé' }
    ];

    switch (current) {
      case EventStatus.SCHEDULED:
        return allStatuses.filter(s => 
          ['SCHEDULED', 'ONGOING', 'CANCELLED'].includes(s.value)
        );
      case EventStatus.ONGOING:
        return allStatuses.filter(s => 
          ['ONGOING', 'COMPLETED', 'CANCELLED'].includes(s.value)
        );
      case EventStatus.CANCELLED:
        return allStatuses.filter(s => 
          ['CANCELLED', 'SCHEDULED'].includes(s.value)
        );
      case EventStatus.COMPLETED:
        return allStatuses.filter(s => s.value === 'COMPLETED');
      default:
        return allStatuses;
    }
  }

  changeStatus(newStatus: string): void {
    if (!this.event?.eventId) return;
    if (newStatus === this.event.status) return;

    if (newStatus === 'CANCELLED') {
      if (!confirm('Êtes-vous sûr de vouloir annuler cet événement ?')) {
        return;
      }
    }

    if (newStatus === 'COMPLETED') {
      if (!confirm('Marquer cet événement comme terminé ? Vous pourrez ensuite valider les présences.')) {
        return;
      }
    }

    this.isChangingStatus = true;
    this.statusError = '';

    this.eventService.updateEventStatus(this.event.eventId, newStatus).subscribe({
      next: (updatedEvent) => {
        this.event = updatedEvent;
        this.isChangingStatus = false;
      },
      error: (err) => {
        console.error('Erreur changement statut:', err);
        this.statusError = 'Erreur lors du changement de statut.';
        this.isChangingStatus = false;
        this.loadEvent(this.event!.eventId!);
      }
    });
  }

  // ─── Chargement ─────────────────────────────────────────────────────────────

  private loadEvent(id: string): void {
    this.isLoading = true;

    this.eventService.getEventById(id).subscribe({
      next: event => {
        this.event = event;
        this.loadParticipations(id);
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
        this.participations = data;
        // Trouver la participation de l'utilisateur connecté
        this.userParticipation = data.find(p => {
          const pUserId = this.extractUserId(p);
          return pUserId === this.userId;
        }) ?? null;
      },
      error: () => {}
    });
  }

  // ✅ NOUVEAU : Charger le score d'assiduité de l'utilisateur
  private loadUserAttendanceRate(): void {
    if (!this.userId) return;

    this.eventService.getAttendanceRate(this.userId).subscribe({
      next: (rate) => {
        this.userAttendanceRate = rate;
      },
      error: () => {
        this.userAttendanceRate = null;
      }
    });
  }

  // ─── RSVP ───────────────────────────────────────────────────────────────────

  respondToEvent(status: RSVPStatus): void {
  if (!this.event?.eventId) return;
  if (!this.userId) {
    this.rsvpError = 'Vous devez être connecté pour participer.';
    return;
  }

  this.isSubmittingRSVP = true;
  this.rsvpError = '';

  this.eventService.respondToEvent(this.event.eventId, this.userId, status).subscribe({
    next: participation => {
      this.userParticipation = participation;
      this.isSubmittingRSVP = false;
      this.loadParticipations(this.event!.eventId!);
    },
    error: (err) => {
      console.error('Erreur RSVP:', err);
      this.rsvpError = err.error?.message || 'Erreur lors de la réponse.';
      this.isSubmittingRSVP = false;
    }
  });
}

  // ─── Paiement ───────────────────────────────────────────────────────────────

  /** True si l'utilisateur a un paiement en attente sur un événement encore planifié. */
  get canPayNow(): boolean {
    return !!this.userParticipation
      && this.userParticipation.paymentStatus === PaymentStatus.PENDING
      && this.event?.status === EventStatus.SCHEDULED;
  }

  /** Affiche la page de paiement (overlay). */
  showCheckout = false;

  /**
   * Clic « Payer » :
   *  - Si Flouci est configuré (jetons) → redirige vers la vraie page Flouci.
   *  - Sinon → ouvre la page de paiement intégrée (interface de paiement simulée).
   */
  confirmPayment(): void {
    if (!this.event?.eventId || !this.userId) return;

    this.isPaying = true;
    this.payError = '';

    this.eventService.initiateFlouciPayment(this.event.eventId, this.userId).subscribe({
      next: (res) => {
        this.isPaying = false;
        if (res?.link) {
          window.location.href = res.link;      // vraie passerelle Flouci
        } else {
          this.openCheckout();                  // page de paiement intégrée
        }
      },
      error: () => {
        // Flouci non configuré → on affiche quand même une interface de paiement
        this.isPaying = false;
        this.openCheckout();
      }
    });
  }

  openCheckout(): void { this.showCheckout = true; this.payError = ''; }
  closeCheckout(): void { this.showCheckout = false; }

  /** Confirmation du paiement depuis la page de paiement intégrée. */
  payNow(): void {
    if (!this.event?.eventId || !this.userId) return;

    this.isPaying = true;
    this.payError = '';

    this.eventService.confirmPayment(this.event.eventId, this.userId).subscribe({
      next: participation => {
        this.userParticipation = participation;
        this.isPaying = false;
        this.showCheckout = false;
        this.loadParticipations(this.event!.eventId!);
      },
      error: (err) => {
        console.error('Erreur paiement:', err);
        this.payError = err.error?.message || 'Erreur lors du paiement.';
        this.isPaying = false;
      }
    });
  }

  /** Au retour de la page Flouci (?flouciPaid=1) : vérifie et finalise le paiement. */
  private handleFlouciReturn(eventId: string): void {
    const flag = this.route.snapshot.queryParamMap.get('flouciPaid');
    if (!flag) return;

    if (flag === '1') {
      this.eventService.verifyFlouciPayment(eventId, this.userId).subscribe({
        next: (participation) => {
          this.userParticipation = participation;
          this.loadParticipations(eventId);
        },
        error: () => { this.payError = 'Le paiement Flouci n\'a pas pu être confirmé.'; }
      });
    } else {
      this.payError = 'Paiement annulé ou échoué.';
    }
  }

  // ─── Annulation participation (RSVP) ─────────────────────────────────────────

  /** True si l'utilisateur a une participation annulable (événement encore planifié). */
  get canCancelRsvp(): boolean {
    return !!this.userParticipation
      && this.event?.status === EventStatus.SCHEDULED
      && this.userParticipation.participationStatus !== ParticipationStatus.DECLINED;
  }

  cancelRsvp(): void {
    if (!this.event?.eventId || !this.userId) return;
    if (!confirm('Annuler votre participation à cet événement ?')) return;

    this.isCancellingRsvp = true;
    this.cancelRsvpError = '';

    this.eventService.cancelRsvp(this.event.eventId, this.userId).subscribe({
      next: () => {
        this.userParticipation = null;
        this.isCancellingRsvp = false;
        this.loadParticipations(this.event!.eventId!);
      },
      error: (err) => {
        console.error('Erreur annulation participation:', err);
        this.cancelRsvpError = err.error?.message || 'Erreur lors de l\'annulation.';
        this.isCancellingRsvp = false;
      }
    });
  }

  // ─── Annulation ─────────────────────────────────────────────────────────────

  cancelEvent(): void {
    if (!this.event?.eventId) return;
    if (!confirm('Êtes-vous sûr de vouloir annuler cet événement ? Cette action est irréversible.')) return;

    this.isCancelling = true;
    this.cancelError = '';

    this.eventService.cancelEvent(this.event.eventId).subscribe({
      next: () => {
        this.isCancelling = false;
        this.router.navigate(['/events']);
      },
      error: () => {
        this.cancelError = 'Erreur lors de l\'annulation.';
        this.isCancelling = false;
      }
    });
  }

  // ─── Validation des présences ────────────────────────────────────────────────

  togglePresence(participation: EventParticipation, isPresent: boolean): void {
    if (!this.event?.eventId) return;

    const participationUserId = this.extractUserId(participation);

    this.eventService.validatePresence(this.event.eventId, participationUserId, isPresent).subscribe({
      next: updated => {
        const idx = this.participations.findIndex(
          p => p.participationId === updated.participationId
        );
        if (idx !== -1) this.participations[idx] = updated;
      },
      error: (err) => {
        console.error('Erreur validation présence:', err);
      }
    });
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  goToEdit(): void {
    if (!this.isAdmin) {
      alert('Seul un administrateur peut modifier un événement.');
      return;
    }
    this.router.navigate(['/events/edit', this.event?.eventId]);
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  // ─── Helpers pour extraire les infos des participants ───────────────────────

  extractUserId(participation: EventParticipation): string {
    if (typeof participation.userId === 'string') {
      return participation.userId;
    }
    return (participation.userId as any)?.userId || '';
  }

  getParticipantName(participation: EventParticipation): string {
    if (typeof participation.userId === 'string') {
      return participation.userId;
    }
    const user = participation.userId as any;
    return user?.displayName || user?.email || user?.userId || 'Inconnu';
  }

  getParticipantInitials(participation: EventParticipation): string {
    const name = this.getParticipantName(participation);
    if (!name || name === 'Inconnu') return '??';
    return name.slice(0, 2).toUpperCase();
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

 getPaymentStatusLabel(status?: PaymentStatus | null): string {
  // Gère null, undefined, ou toute valeur falsy
  if (!status) return '—';
  
  switch (status) {
    case PaymentStatus.PENDING:      return 'En attente';
    case PaymentStatus.PAID:         return 'Payé';
    case PaymentStatus.EXPIRED:      return 'Expiré';
    case PaymentStatus.REFUNDED:     return 'Remboursé';
    case PaymentStatus.NOT_REQUIRED: return 'Non requis';
    default: return '—';
  }
}

 getPaymentStatusClass(status?: PaymentStatus | null): string {
  // Gère null, undefined, ou toute valeur falsy
  if (!status) return '';
  
  switch (status) {
    case PaymentStatus.PENDING:  return 'pay-pending';
    case PaymentStatus.PAID:     return 'pay-paid';
    case PaymentStatus.EXPIRED:  return 'pay-expired';
    case PaymentStatus.REFUNDED: return 'pay-refunded';
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

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-low';
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
    return this.isAdmin && this.isCompleted;
  }
}