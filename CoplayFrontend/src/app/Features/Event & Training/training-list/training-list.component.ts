import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingSession } from 'src/app/Core/Models/Events & Training/TrainingSession';
import { TrainingSessionService } from 'src/app/Core/Services/Events & Training/TrainingSessionService/training-session.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.css']
})
export class TrainingListComponent implements OnInit {

  sessions: TrainingSession[] = [];
  filteredSessions: TrainingSession[] = [];
  filter: 'ALL' | 'UPCOMING' | 'OFFICIAL' | 'FREE' = 'ALL';
  isLoading = false;
  errorMessage = '';

  constructor(
    private sessionService: TrainingSessionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // ✅ CHANGEMENT : on charge TOUTES les sessions (pas par équipe)
    this.sessionService.getAllSessions().subscribe({
      next: (data) => {
        this.sessions = data.sort((a, b) =>
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
        );
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement sessions :', err);
        this.errorMessage = 'Impossible de charger les séances.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const now = new Date();

    switch (this.filter) {
      case 'UPCOMING':
        this.filteredSessions = this.sessions.filter(s => new Date(s.sessionDate) > now);
        break;
      case 'OFFICIAL':
        this.filteredSessions = this.sessions.filter(s => s.isOfficial === true);
        break;
      case 'FREE':
        this.filteredSessions = this.sessions.filter(s => s.isOfficial !== true);
        break;
      default:
        this.filteredSessions = [...this.sessions];
    }
  }

  setFilter(f: 'ALL' | 'UPCOMING' | 'OFFICIAL' | 'FREE'): void {
    this.filter = f;
    this.applyFilter();
  }

  goToCreate(): void {
    this.router.navigate(['/training-sessions/new']);
  }

  goToDetail(sessionId: string): void {
    this.router.navigate(['/training-sessions', sessionId]);
  }

  goToEdit(sessionId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/training-sessions', sessionId, 'edit']);
  }

  cancelSession(session: TrainingSession, event: Event): void {
    event.stopPropagation();
    if (!session.sessionId) return;
    if (!confirm(`Annuler la séance "${session.title}" ?`)) return;

    this.sessionService.cancelSession(session.sessionId).subscribe({
      next: () => this.loadSessions(),
      error: () => alert('Erreur lors de l\'annulation.')
    });
  }

  completeSession(session: TrainingSession, event: Event): void {
    event.stopPropagation();
    if (!session.sessionId) return;
    if (!confirm(`Marquer "${session.title}" comme terminée ?`)) return;

    this.sessionService.completeSession(session.sessionId).subscribe({
      next: () => this.loadSessions(),
      error: () => alert('Erreur lors de la complétion.')
    });
  }

  deleteSession(session: TrainingSession, event: Event): void {
    event.stopPropagation();
    if (!session.sessionId) return;
    if (!confirm(`Supprimer définitivement "${session.title}" ?`)) return;

    this.sessionService.deleteSession(session.sessionId).subscribe({
      next: () => this.loadSessions(),
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'SCHEDULED': return 'status-scheduled';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'SCHEDULED': return 'Planifiée';
      case 'COMPLETED': return 'Terminée';
      case 'CANCELLED': return 'Annulée';
      default: return '—';
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  isPast(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  canManage(): boolean {
    return this.authService.isAdmin() || this.authService.getUserRole() === 'COACH';
  }

  canCreateFreeSession(): boolean {
    return this.authService.isLoggedIn();
  }
}