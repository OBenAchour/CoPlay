import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingSession } from 'src/app/Core/Models/Events & Training/TrainingSession';
import { TrainingSessionService } from 'src/app/Core/Services/Events & Training/TrainingSessionService/training-session.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

@Component({
  selector: 'app-training-session-detail',
  templateUrl: './training-session-detail.component.html',
  styleUrls: ['./training-session-detail.component.css']
})
export class TrainingSessionDetailComponent implements OnInit {

  session: TrainingSession | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private sessionService: TrainingSessionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadSession(id);
  }

  loadSession(id: string): void {
    this.sessionService.getSessionById(id).subscribe({
      next: data => {
        this.session = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Séance introuvable.';
        this.isLoading = false;
      }
    });
  }

  goEdit(): void {
    if (this.session?.sessionId) {
      this.router.navigate(['/training-sessions', this.session.sessionId, 'edit']);
    }
  }

  cancelSession(): void {
    if (!this.session?.sessionId) return;
    if (!confirm('Annuler cette séance ?')) return;
    this.sessionService.cancelSession(this.session.sessionId).subscribe({
      next: () => this.loadSession(this.session!.sessionId!),
      error: () => alert('Erreur')
    });
  }

  completeSession(): void {
    if (!this.session?.sessionId) return;
    if (!confirm('Marquer comme terminée ?')) return;
    this.sessionService.completeSession(this.session.sessionId).subscribe({
      next: () => this.loadSession(this.session!.sessionId!),
      error: () => alert('Erreur')
    });
  }

  goBack(): void {
    this.router.navigate(['/training-sessions']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  canManage(): boolean {
    return this.authService.isAdmin() || this.authService.getUserRole() === 'COACH';
  }
}