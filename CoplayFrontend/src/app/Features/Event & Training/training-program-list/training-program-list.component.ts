import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingProgram } from 'src/app/Core/Models/Events & Training/TrainingProgram';
import { TrainingService } from 'src/app/Core/Services/Events & Training/TrainingService/training-service.service';
import { EventService } from 'src/app/Core/Services/Events & Training/EventService/event-service.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

@Component({
  selector: 'app-training-program-list',
  templateUrl: './training-program-list.component.html',
  styleUrls: ['./training-program-list.component.css']
})
export class TrainingProgramListComponent implements OnInit {

  programs: TrainingProgram[] = [];
  isLoading = false;
  errorMessage = '';

  // ✅ Recommandation par niveau
  showingRecommended = false;
  currentUserId = '';
  myLevel = '';

  constructor(
    private trainingService: TrainingService,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPrograms();
    // Récupère l'utilisateur connecté (userId + niveau) via /api/users/me
    this.eventService.getCurrentUser().subscribe({
      next: (u) => {
        this.currentUserId = u?.userId || u?.id || '';
        this.myLevel = u?.profile?.level || '';
      },
      error: () => {}
    });
  }

  loadPrograms(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showingRecommended = false;

    this.trainingService.getAllPrograms().subscribe({
      next: (data) => {
        this.programs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Impossible de charger les programmes.';
        this.isLoading = false;
      }
    });
  }

  /** FONCTION MÉTIER — affiche les programmes recommandés pour le niveau du joueur. */
  loadRecommended(): void {
    if (!this.currentUserId) {
      this.errorMessage = 'Connectez-vous pour voir vos recommandations.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.trainingService.getRecommendedPrograms(this.currentUserId).subscribe({
      next: (data) => {
        this.programs = data;
        this.showingRecommended = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Impossible de charger les recommandations.';
        this.isLoading = false;
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/training-programs/new']);
  }

  goToDetail(programId: string): void {
    this.router.navigate(['/training-programs', programId]);
  }

  deleteProgram(program: TrainingProgram): void {
    if (!program.programId) return;
    if (!confirm(`Supprimer le programme "${program.title}" ?`)) return;

    this.trainingService.deleteProgram(program.programId).subscribe({
      next: () => this.loadPrograms(),
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  canManage(): boolean {
    return this.authService.isAdmin() || this.authService.getUserRole() === 'COACH';
  }
}