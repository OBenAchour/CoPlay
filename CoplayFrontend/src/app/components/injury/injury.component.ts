import { Component, OnInit } from '@angular/core';
import { InjuryService, Injury, InjurySeverity } from '../../services/Injury/injury.service';

@Component({
  selector: 'app-injury',
  templateUrl: './injury.component.html',
  styleUrls: ['./injury.component.css']
})
export class InjuryComponent implements OnInit {

  athleteId = '';
  injuries: Injury[] = [];
  available: boolean | null = null;
  loading = false;

  newInjury = {
    bodyPart: '',
    severity: 'MILD' as InjurySeverity,
    startDate: '',
    expectedRecovery: '',
    notes: '',
    reportedByCoachId: localStorage.getItem('userId') || ''
  };

  severities: InjurySeverity[] = ['MILD', 'MODERATE', 'SEVERE'];

  constructor(private injuryService: InjuryService) {}

  ngOnInit(): void {}

  load() {
    if (!this.athleteId) return;
    this.loading = true;
    this.injuryService.listAll(this.athleteId).subscribe({
      next: i => { this.injuries = i; this.loading = false; },
      error: e => { console.error(e); this.loading = false; }
    });
    this.injuryService.isAvailable(this.athleteId).subscribe({
      next: a => this.available = a
    });
  }

  report() {
    if (!this.athleteId || !this.newInjury.bodyPart) {
      alert('Athlete ID et zone du corps requis');
      return;
    }
    this.injuryService.report(this.athleteId, this.newInjury.bodyPart, this.newInjury.severity, {
      reportedByCoachId: this.newInjury.reportedByCoachId,
      startDate: this.newInjury.startDate || undefined,
      expectedRecovery: this.newInjury.expectedRecovery || undefined,
      notes: this.newInjury.notes || undefined
    }).subscribe({
      next: () => {
        this.newInjury.bodyPart = '';
        this.newInjury.notes = '';
        this.newInjury.startDate = '';
        this.newInjury.expectedRecovery = '';
        this.load();
      },
      error: e => alert('Erreur: ' + (e?.error?.message || e.message))
    });
  }

  heal(id: string) {
    if (!confirm('Marquer cette blessure comme guérie ?')) return;
    this.injuryService.heal(id).subscribe({ next: () => this.load() });
  }
}
