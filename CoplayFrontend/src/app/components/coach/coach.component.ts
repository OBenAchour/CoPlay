import { Component, OnInit } from '@angular/core';
import { CoachService } from '../../services/Coach/coach.service';
import { CoachingSessionService, CoachingSession } from '../../services/CoachingSession/coaching-session.service';
import { ReviewService } from '../../services/Marketplace/review.service';
import { InjuryService, Injury } from '../../services/Injury/injury.service';
import { MarketplaceServiceApi, MarketplaceService } from '../../services/Marketplace/marketplace-service.service';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css']
})
export class CoachComponent implements OnInit {

  coachId = localStorage.getItem('userId') || '';

  sessions: CoachingSession[] = [];
  offers: MarketplaceService[] = [];
  averageRating = 0;

  athleteIdQuery = '';
  athleteInjuries: Injury[] = [];

  proposeTeamId = '';
  proposeCoachId = '';

  newScheduleAthleteId = '';
  newScheduleAt = '';
  newScheduleDuration = 60;
  scheduleError = '';

  loading = false;

  constructor(
    private coachService: CoachService,
    private sessionService: CoachingSessionService,
    private reviewService: ReviewService,
    private injuryService: InjuryService,
    private offerService: MarketplaceServiceApi
  ) {}

  ngOnInit(): void {
    if (this.coachId) {
      this.loadAll();
    }
  }

  loadAll() {
    this.loading = true;
    this.sessionService.byCoach(this.coachId).subscribe({
      next: s => this.sessions = s,
      error: e => console.error(e)
    });
    this.reviewService.coachAverage(this.coachId).subscribe({
      next: avg => this.averageRating = avg,
      error: e => console.error(e)
    });
    this.offerService.list({ providerId: this.coachId }).subscribe({
      next: o => { this.offers = o; this.loading = false; },
      error: e => { console.error(e); this.loading = false; }
    });
  }

  propose() {
    if (!this.proposeTeamId || !this.proposeCoachId) return;
    this.coachService.proposerCoach(this.proposeTeamId, this.proposeCoachId).subscribe({
      next: () => { this.proposeTeamId = ''; this.proposeCoachId = ''; alert('Proposition envoyée'); },
      error: e => alert('Erreur: ' + (e?.error?.message || e.message))
    });
  }

  loadAthleteInjuries() {
    if (!this.athleteIdQuery) return;
    this.injuryService.listActive(this.athleteIdQuery).subscribe({
      next: i => this.athleteInjuries = i,
      error: e => console.error(e)
    });
  }

  scheduleSession() {
    this.scheduleError = '';
    if (!this.newScheduleAthleteId || !this.newScheduleAt) {
      this.scheduleError = 'Athlete et date requis';
      return;
    }
    this.sessionService.schedule(this.coachId, this.newScheduleAthleteId, this.newScheduleAt,
      { duration: this.newScheduleDuration }
    ).subscribe({
      next: s => { this.sessions.push(s); this.newScheduleAthleteId = ''; this.newScheduleAt = ''; },
      error: e => this.scheduleError = e?.error?.message || 'Athlète indisponible (blessure ACTIVE ?)'
    });
  }

  completeSession(id: string) {
    this.sessionService.complete(id).subscribe({ next: () => this.loadAll() });
  }

  cancelSession(id: string) {
    this.sessionService.cancel(id).subscribe({ next: () => this.loadAll() });
  }

  publishOffer(id: string) {
    this.offerService.publish(id).subscribe({ next: () => this.loadAll() });
  }

  archiveOffer(id: string) {
    this.offerService.archive(id).subscribe({ next: () => this.loadAll() });
  }
}
