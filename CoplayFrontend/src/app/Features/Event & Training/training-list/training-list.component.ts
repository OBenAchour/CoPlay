import { Component, OnInit } from '@angular/core';

import { TrainingProgram } from 'src/app/Core/Models/Events & Training/TrainingProgram';
import { Exercise }        from 'src/app/Core/Models/Events & Training/Exercise';
import { TrainingService } from 'src/app/Core/Services/Events & Training/TrainingService/training-service.service';

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.css']
})
export class TrainingListComponent implements OnInit {

  programs: TrainingProgram[]         = [];
  filteredPrograms: TrainingProgram[] = [];
  selectedLevel  = 'ALL';
  isLoading      = false;
  errorMessage   = '';

  // Accordion : ensemble des IDs de programmes ouverts
  expandedPrograms = new Set<string>();

  // Formulaire nouveau programme
  showNewProgramForm = false;
  newProgram: Partial<TrainingProgram> = { title: '', level: '', duration: undefined };
  isCreatingProgram = false;
  programFormError  = '';

  // Formulaires nouveaux exercices : un par programme
  showExerciseForm: { [programId: string]: boolean }            = {};
  newExercise:      { [programId: string]: Partial<Exercise> }  = {};
  isAddingExercise: { [programId: string]: boolean }            = {};
  exerciseFormError: { [programId: string]: string }            = {};

  readonly teamId = 'test-team-001';

  readonly levelOptions = [
    { value: 'ALL',          label: 'Tous' },
    { value: 'BEGINNER',     label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'ADVANCED',     label: 'Avancé' },
    { value: 'PROFESSIONAL', label: 'Professionnel' }
  ];

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  // ─── Chargement ─────────────────────────────────────────────────────────────

  loadPrograms(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    this.trainingService.getProgramsByTeam(this.teamId).subscribe({
      next: data => {
        this.programs = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des programmes.';
        this.isLoading    = false;
      }
    });
  }

  // ─── Filtre par niveau ───────────────────────────────────────────────────────

  filterByLevel(level: string): void {
    this.selectedLevel = level;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredPrograms = this.selectedLevel === 'ALL'
      ? [...this.programs]
      : this.programs.filter(p => p.level === this.selectedLevel);
  }

  // ─── Accordion ───────────────────────────────────────────────────────────────

  toggleAccordion(programId: string): void {
    if (this.expandedPrograms.has(programId)) {
      this.expandedPrograms.delete(programId);
    } else {
      this.expandedPrograms.add(programId);
    }
  }

  isExpanded(programId: string): boolean {
    return this.expandedPrograms.has(programId);
  }

  // ─── Créer un programme ─────────────────────────────────────────────────────

  openNewProgramForm(): void {
    this.showNewProgramForm = true;
    this.newProgram         = { title: '', level: '', duration: undefined };
    this.programFormError   = '';
  }

  cancelNewProgram(): void {
    this.showNewProgramForm = false;
    this.programFormError   = '';
  }

  createProgram(): void {
    if (!this.newProgram.title?.trim()) {
      this.programFormError = 'Le titre est obligatoire.';
      return;
    }

    const payload: TrainingProgram = {
      teamId:    this.teamId,
      title:     this.newProgram.title.trim(),
      level:     this.newProgram.level  || undefined,
      duration:  this.newProgram.duration || undefined,
      exercises: []
    };

    this.isCreatingProgram = true;
    this.programFormError  = '';

    this.trainingService.createProgram(payload).subscribe({
      next: created => {
        this.programs.push(created);
        this.applyFilter();
        this.showNewProgramForm = false;
        this.isCreatingProgram  = false;
        // Ouvrir automatiquement le programme créé
        if (created.programId) this.expandedPrograms.add(created.programId);
      },
      error: () => {
        this.programFormError  = 'Erreur lors de la création du programme.';
        this.isCreatingProgram = false;
      }
    });
  }

  // ─── Supprimer un programme ─────────────────────────────────────────────────

  deleteProgram(program: TrainingProgram): void {
    if (!program.programId) return;
    if (!confirm(`Supprimer le programme "${program.title}" et tous ses exercices ?`)) return;

    this.trainingService.deleteProgram(program.programId).subscribe({
      next: () => {
        this.programs = this.programs.filter(p => p.programId !== program.programId);
        this.applyFilter();
        this.expandedPrograms.delete(program.programId!);
      },
      error: () => {}
    });
  }

  // ─── Ajouter un exercice ─────────────────────────────────────────────────────

  openExerciseForm(programId: string): void {
    this.showExerciseForm[programId]  = true;
    this.newExercise[programId]       = { name: '', description: '', videoUrl: '' };
    this.exerciseFormError[programId] = '';
    // S'assurer que le programme est ouvert
    this.expandedPrograms.add(programId);
  }

  cancelExerciseForm(programId: string): void {
    this.showExerciseForm[programId] = false;
    this.exerciseFormError[programId] = '';
  }

  addExercise(programId: string): void {
    const ex = this.newExercise[programId];
    if (!ex?.name?.trim()) {
      this.exerciseFormError[programId] = 'Le nom de l\'exercice est obligatoire.';
      return;
    }

    const payload: Exercise = {
      name:        ex.name.trim(),
      description: ex.description?.trim() || undefined,
      videoUrl:    ex.videoUrl?.trim()    || undefined
    };

    this.isAddingExercise[programId]  = true;
    this.exerciseFormError[programId] = '';

    this.trainingService.addExercise(programId, payload).subscribe({
      next: updatedProgram => {
        const idx = this.programs.findIndex(p => p.programId === programId);
        if (idx !== -1) this.programs[idx] = updatedProgram;
        this.applyFilter();
        this.showExerciseForm[programId]  = false;
        this.isAddingExercise[programId]  = false;
      },
      error: () => {
        this.exerciseFormError[programId] = 'Erreur lors de l\'ajout de l\'exercice.';
        this.isAddingExercise[programId]  = false;
      }
    });
  }

  // ─── Supprimer un exercice ───────────────────────────────────────────────────

  removeExercise(programId: string, exerciseId: string, exerciseName: string): void {
    if (!confirm(`Supprimer l'exercice "${exerciseName}" ?`)) return;

    this.trainingService.removeExercise(programId, exerciseId).subscribe({
      next: updatedProgram => {
        const idx = this.programs.findIndex(p => p.programId === programId);
        if (idx !== -1) this.programs[idx] = updatedProgram;
        this.applyFilter();
      },
      error: () => {}
    });
  }

  // ─── Helpers template ────────────────────────────────────────────────────────

  getLevelLabel(level?: string): string {
    const opt = this.levelOptions.find(o => o.value === level);
    return opt ? opt.label : level || '—';
  }

  getLevelClass(level?: string): string {
    switch (level) {
      case 'BEGINNER':     return 'level-beginner';
      case 'INTERMEDIATE': return 'level-intermediate';
      case 'ADVANCED':     return 'level-advanced';
      case 'PROFESSIONAL': return 'level-professional';
      default: return '';
    }
  }
}
