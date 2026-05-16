import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingProgram } from 'src/app/Core/Models/Events & Training/TrainingProgram';
import { Exercise } from 'src/app/Core/Models/Events & Training/Exercise';
import { TrainingService } from 'src/app/Core/Services/Events & Training/TrainingService/training-service.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { Team } from 'src/app/Core/Models/Teams/Team';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

@Component({
  selector: 'app-training-program-detail',
  templateUrl: './training-program-detail.component.html',
  styleUrls: ['./training-program-detail.component.css']
})
export class TrainingProgramDetailComponent implements OnInit {

  program: TrainingProgram | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Données pour le formulaire de modification du programme
  teams: Team[] = [];
  levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

  // Mode édition du programme
  isEditingProgram = false;
  programFormData: TrainingProgram = {
    title: '',
    level: '',
    duration: 60,
    teamId: ''
  };

  // Formulaire d'exercice
  showExerciseForm = false;
  isEditingExercise = false;
  editingExerciseId: string | null = null;
  exerciseFormData: Exercise = {
    exerciseId: '',
    name: '',
    description: '',
    videoUrl: ''
  };

  constructor(
    private trainingService: TrainingService,
    private teamService: TeamService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProgram(id);
    this.loadTeams();
  }

  loadProgram(id: string): void {
    this.isLoading = true;
    this.trainingService.getProgramById(id).subscribe({
      next: data => {
        this.program = data;
        this.fillProgramForm(data);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Programme introuvable.';
        this.isLoading = false;
      }
    });
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: data => this.teams = data,
      error: () => {}
    });
  }

  fillProgramForm(p: TrainingProgram): void {
    this.programFormData = {
      programId: p.programId,
      title: p.title,
      level: p.level || '',
      duration: p.duration || 60,
      teamId: typeof p.teamId === 'string' ? p.teamId : (p.teamId as any)?.teamId || ''
    };
  }

  // ═══════════════════════════════════════════════════════
  //  GESTION DU PROGRAMME
  // ═══════════════════════════════════════════════════════

  startEditProgram(): void {
    this.isEditingProgram = true;
    if (this.program) this.fillProgramForm(this.program);
  }

  cancelEditProgram(): void {
    this.isEditingProgram = false;
    if (this.program) this.fillProgramForm(this.program);
  }

  saveProgram(): void {
    if (!this.program?.programId) return;
    if (!this.programFormData.title?.trim()) {
      this.errorMessage = 'Le titre est obligatoire.';
      return;
    }
    if (!this.programFormData.teamId) {
      this.errorMessage = 'Veuillez sélectionner une équipe.';
      return;
    }

    this.errorMessage = '';

    this.trainingService.updateProgram(this.program.programId, this.programFormData).subscribe({
      next: updated => {
        this.program = updated;
        this.isEditingProgram = false;
        this.successMessage = '✅ Programme modifié avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => alert('Erreur lors de la sauvegarde du programme.')
    });
  }

  // ═══════════════════════════════════════════════════════
  //  GESTION DES EXERCICES
  // ═══════════════════════════════════════════════════════

  openAddExerciseForm(): void {
    this.isEditingExercise = false;
    this.editingExerciseId = null;
    this.exerciseFormData = {
      exerciseId: '',
      name: '',
      description: '',
      videoUrl: ''
    };
    this.showExerciseForm = true;
  }

  openEditExerciseForm(exercise: Exercise): void {
    this.isEditingExercise = true;
    this.editingExerciseId = exercise.exerciseId || null;
    this.exerciseFormData = { ...exercise };
    this.showExerciseForm = true;
  }

  cancelExerciseForm(): void {
    this.showExerciseForm = false;
  }

  saveExercise(): void {
    if (!this.program?.programId) return;
    if (!this.exerciseFormData.name?.trim()) {
      alert('Le nom de l\'exercice est obligatoire.');
      return;
    }

    if (this.isEditingExercise && this.editingExerciseId) {
      this.trainingService.updateExercise(
        this.program.programId,
        this.editingExerciseId,
        this.exerciseFormData
      ).subscribe({
        next: updated => {
          this.program = updated;
          this.showExerciseForm = false;
        },
        error: () => alert('Erreur lors de la modification.')
      });
    } else {
      this.trainingService.addExercise(this.program.programId, this.exerciseFormData).subscribe({
        next: updated => {
          this.program = updated;
          this.showExerciseForm = false;
        },
        error: () => alert('Erreur lors de l\'ajout.')
      });
    }
  }

  deleteExercise(exercise: Exercise): void {
    if (!this.program?.programId || !exercise.exerciseId) return;
    if (!confirm(`Supprimer l'exercice "${exercise.name}" ?`)) return;

    this.trainingService.removeExercise(this.program.programId, exercise.exerciseId).subscribe({
      next: updated => this.program = updated,
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  // ═══════════════════════════════════════════════════════

  goBack(): void {
    this.router.navigate(['/training-programs']);
  }

  canManage(): boolean {
    return this.authService.isAdmin() || this.authService.getUserRole() === 'COACH';
  }
}