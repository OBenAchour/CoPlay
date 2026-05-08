import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingSessionService } from 'src/app/Core/Services/Events & Training/TrainingSessionService/training-session.service';
import { TrainingProgram } from 'src/app/Core/Models/Events & Training/TrainingProgram';
import { TrainingSessionRequest } from 'src/app/Core/Models/Events & Training/TrainingSession';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { TrainingService } from 'src/app/Core/Services/Events & Training/TrainingService/training-service.service';

// ⬇️⬇️⬇️ AJUSTE CES 2 CHEMINS SELON TON PROJET ⬇️⬇️⬇️
import { TeamService } from 'src/app/services/Team/team.service';
import { Team } from 'src/app/Core/Models/Teams/Team';
// ⬆️⬆️⬆️ AJUSTE CES 2 CHEMINS SELON TON PROJET ⬆️⬆️⬆️

@Component({
  selector: 'app-training-session-form',
  templateUrl: './training-session-form.component.html',
  styleUrls: ['./training-session-form.component.css']
})
export class TrainingSessionFormComponent implements OnInit {

  isEditMode = false;
  sessionId: string | null = null;
  isSubmitting = false;
  errorMessage = '';

  programs: TrainingProgram[] = [];
  teams: Team[] = [];                              // ⬅️ Liste des équipes pour le dropdown
  sessionType: 'OFFICIAL' | 'FREE' = 'FREE';

  formData: TrainingSessionRequest = {
    title: '',
    description: '',
    sessionDate: '',
    duration: 60,
    teamId: '',                                    // ⬅️ Vide au départ, l'utilisateur choisit
    locationId: '',
    createdById: '',
    programId: ''
  };

  constructor(
    private sessionService: TrainingSessionService,
    private trainingService: TrainingService,
    private teamService: TeamService,              // ⬅️ Service Team injecté
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

 ngOnInit(): void {
  console.log('🔍 USER ID:', this.authService.getUserId());
  console.log('🔍 USER:', this.authService.getCurrentUser());
  
  this.formData.createdById = this.authService.getUserId();
  this.loadTeams();

  this.sessionId = this.route.snapshot.paramMap.get('id');
  if (this.sessionId) {
    this.isEditMode = true;
    this.loadSession();
  }
}

  /**
   * Charge la liste des équipes pour le dropdown
   */
  loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: (data: Team[]) => {
        this.teams = data;
        console.log('Équipes chargées:', data.length);
      },
      error: err => {
        console.error('Erreur chargement équipes:', err);
        this.errorMessage = 'Impossible de charger la liste des équipes.';
      }
    });
  }

  /**
   * Appelée quand l'utilisateur sélectionne une équipe
   * → recharge les programmes de cette équipe
   */
  onTeamChange(): void {
    if (this.formData.teamId) {
      this.loadPrograms();
    } else {
      this.programs = [];
    }
  }

  loadPrograms(): void {
    if (!this.formData.teamId) return;
    this.trainingService.getProgramsByTeam(this.formData.teamId).subscribe({
      next: data => this.programs = data,
      error: () => this.programs = []
    });
  }

  loadSession(): void {
    if (!this.sessionId) return;
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: s => {
        this.formData = {
          title: s.title,
          description: s.description || '',
          sessionDate: s.sessionDate.substring(0, 16),
          duration: s.duration,
          teamId: typeof s.teamId === 'string' ? s.teamId : s.teamId?.teamId,
          locationId: s.locationId?.locationId || '',
          createdById: s.createdBy?.userId || this.authService.getUserId(),
          programId: s.program?.programId || ''
        };
        this.sessionType = s.isOfficial ? 'OFFICIAL' : 'FREE';
        this.loadPrograms();
      },
      error: () => this.errorMessage = 'Erreur lors du chargement.'
    });
  }

  onSessionTypeChange(): void {
    if (this.sessionType === 'FREE') {
      this.formData.programId = '';
    }
  }

  onSubmit(): void {
    if (!this.formData.title?.trim()) {
      this.errorMessage = 'Le titre est obligatoire.';
      return;
    }
    if (!this.formData.sessionDate) {
      this.errorMessage = 'La date est obligatoire.';
      return;
    }
    if (!this.formData.teamId) {
      this.errorMessage = 'Veuillez sélectionner une équipe.';
      return;
    }

    const payload: TrainingSessionRequest = {
      ...this.formData,
      programId: this.sessionType === 'OFFICIAL' ? this.formData.programId : undefined,
      locationId: this.formData.locationId || undefined
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    const obs = this.isEditMode && this.sessionId
      ? this.sessionService.updateSession(this.sessionId, payload)
      : this.sessionService.createSession(payload);

    obs.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/training-sessions']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la sauvegarde.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/training-sessions']);
  }

  canCreateOfficial(): boolean {
    return this.authService.isAdmin() || this.authService.getUserRole() === 'COACH';
  }
}