import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingProgram } from 'src/app/Core/Models/Events & Training/TrainingProgram';
import { TrainingService } from 'src/app/Core/Services/Events & Training/TrainingService/training-service.service';
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

  constructor(
    private trainingService: TrainingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.isLoading = true;
    this.errorMessage = '';

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