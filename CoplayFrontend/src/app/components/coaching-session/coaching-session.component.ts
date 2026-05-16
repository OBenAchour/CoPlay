import { Component, OnInit } from '@angular/core';
import { CoachingSessionService, CoachingSession } from '../../services/CoachingSession/coaching-session.service';

@Component({
  selector: 'app-coaching-session',
  templateUrl: './coaching-session.component.html',
  styleUrls: ['./coaching-session.component.css']
})
export class CoachingSessionComponent implements OnInit {

  userId = localStorage.getItem('userId') || '';
  role: 'coach' | 'athlete' = 'athlete';
  sessions: CoachingSession[] = [];
  filterStatus = '';
  loading = false;

  newSession = {
    coachId: '',
    athleteId: '',
    programId: '',
    scheduledAt: '',
    duration: 60
  };

  linkServiceId = '';
  selectedSessionId = '';
  scheduleError = '';
  completeNotes = '';

  constructor(private sessionService: CoachingSessionService) {}

  ngOnInit(): void {
    if (this.userId) this.load();
  }

  load() {
    this.loading = true;
    const obs = this.role === 'coach'
      ? this.sessionService.byCoach(this.userId)
      : this.sessionService.byAthlete(this.userId);
    obs.subscribe({
      next: s => { this.sessions = s; this.loading = false; },
      error: e => { console.error(e); this.loading = false; }
    });
  }

  filtered() {
    return this.filterStatus
      ? this.sessions.filter(s => s.status === this.filterStatus)
      : this.sessions;
  }

  schedule() {
    this.scheduleError = '';
    if (!this.newSession.coachId || !this.newSession.athleteId || !this.newSession.scheduledAt) {
      this.scheduleError = 'Coach, athlète et date requis';
      return;
    }
    this.sessionService.schedule(
      this.newSession.coachId,
      this.newSession.athleteId,
      this.newSession.scheduledAt,
      {
        programId: this.newSession.programId || undefined,
        duration: this.newSession.duration
      }
    ).subscribe({
      next: () => {
        this.newSession.athleteId = '';
        this.newSession.programId = '';
        this.newSession.scheduledAt = '';
        this.load();
      },
      error: e => this.scheduleError = e?.error?.message || 'Athlète indisponible (blessure ACTIVE ?)'
    });
  }

  complete(id: string) {
    this.sessionService.complete(id, this.completeNotes).subscribe({
      next: () => { this.completeNotes = ''; this.load(); }
    });
  }

  cancel(id: string) {
    if (!confirm('Annuler cette session ?')) return;
    this.sessionService.cancel(id).subscribe({ next: () => this.load() });
  }

  linkService() {
    if (!this.selectedSessionId || !this.linkServiceId) return;
    this.sessionService.linkService(this.selectedSessionId, this.linkServiceId).subscribe({
      next: () => { this.selectedSessionId = ''; this.linkServiceId = ''; this.load(); }
    });
  }
}
