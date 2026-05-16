import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingProgram } from 'src/app/Core/Models/Events & Training/TrainingProgram';
import { TrainingService } from 'src/app/Core/Services/Events & Training/TrainingService/training-service.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Component({
  selector: 'app-training-program-form',
  templateUrl: './training-program-form.component.html',
  styleUrls: ['./training-program-form.component.css']
})
export class TrainingProgramFormComponent implements OnInit {

  isSubmitting = false;
  errorMessage = '';

  teams: Team[] = [];

  formData: TrainingProgram = {
    title: '',
    level: '',
    duration: 60,
    teamId: ''
  };

  levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

  constructor(
    private trainingService: TrainingService,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: data => this.teams = data,
      error: () => this.errorMessage = 'Impossible de charger les équipes.'
    });
  }

  onSubmit(): void {
    if (!this.formData.title?.trim()) {
      this.errorMessage = 'Le titre est obligatoire.';
      return;
    }
    if (!this.formData.teamId) {
      this.errorMessage = 'Veuillez sélectionner une équipe.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.trainingService.createProgram(this.formData).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        // ✅ Après création, on va à la page détail pour ajouter les exercices
        if (created.programId) {
          this.router.navigate(['/training-programs', created.programId]);
        } else {
          this.router.navigate(['/training-programs']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la sauvegarde.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/training-programs']);
  }
}