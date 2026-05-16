import { Component } from '@angular/core';
import { ProgressService, AthleteProgress, ProgressMetric } from '../../services/Progress/progress.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent {

  athleteId = '';
  programId = '';
  history: AthleteProgress[] = [];
  averages: Partial<Record<ProgressMetric, number>> = {};

  metrics: ProgressMetric[] = ['WEIGHT', 'REPS', 'TIME_SECONDS', 'DISTANCE_METERS', 'HEART_RATE'];

  newRecord = {
    exerciseId: '',
    metric: 'WEIGHT' as ProgressMetric,
    value: 0,
    coachId: localStorage.getItem('userId') || ''
  };

  constructor(private progressService: ProgressService) {}

  loadHistory() {
    if (!this.athleteId) return;
    this.progressService.history(this.athleteId).subscribe({
      next: h => this.history = h
    });
  }

  loadProgram() {
    if (!this.athleteId || !this.programId) return;
    this.progressService.programHistory(this.athleteId, this.programId).subscribe({
      next: h => this.history = h
    });
    this.progressService.averages(this.athleteId, this.programId).subscribe({
      next: a => this.averages = a
    });
  }

  record() {
    if (!this.athleteId || !this.programId || !this.newRecord.exerciseId) {
      alert('Athlete, program, exercise requis');
      return;
    }
    this.progressService.record({
      athleteId: this.athleteId,
      programId: this.programId,
      exerciseId: this.newRecord.exerciseId,
      coachId: this.newRecord.coachId,
      metric: this.newRecord.metric,
      value: this.newRecord.value
    }).subscribe({
      next: () => {
        this.newRecord.value = 0;
        this.loadProgram();
      },
      error: e => alert('Erreur: ' + (e?.error?.message || e.message))
    });
  }

  metricEntries() {
    return Object.entries(this.averages) as [ProgressMetric, number][];
  }
}
