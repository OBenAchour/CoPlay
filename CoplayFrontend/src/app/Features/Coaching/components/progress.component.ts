import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { ProgressEntry, PerformanceMetric } from '../../../Core/Models/Coaching/Coaching';

@Component({
  selector: 'app-progress',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a>
        <span>&#8250;</span>
        <span>Progrès</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Performance &middot; Analytics</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Progrès &amp; charge</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Suivez votre composition corporelle et votre charge de travail (ACWR).
          </p>
        </div>
      </div>
    </div>

    <div class="full" style="padding-top:24px">
      <!-- Risk callout -->
      <div class="card-cp p-4 mb-4" *ngIf="risk && risk.label !== 'NONE'"
           style="border-left:4px solid var(--accent)"
           [style.border-left-color]="risk.label === 'HIGH' ? 'var(--danger)' : risk.label === 'ELEVATED' ? 'var(--warning)' : 'var(--accent)'"
           [cpReveal]="0">
        <div style="display:flex;align-items:center;gap:20px">
          <div class="display" style="font-size:2.4rem;line-height:1;color:var(--ink)">{{ risk.acwr }}</div>
          <div style="flex:1">
            <div class="eyebrow mb-1">ACWR &middot; Risque blessure</div>
            <h4 class="display" style="font-size:1.4rem;line-height:1.1;margin:0">
              {{ riskLabel(risk.label) }}
            </h4>
            <p style="color:var(--muted);margin:6px 0 0;font-size:.85rem">
              Charge aigüe (7j) <span class="mono">{{ risk.acute7d }}</span> /
              chronique (28j) <span class="mono">{{ risk.chronic28d }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Body composition -->
        <div class="col-lg-6" [cpReveal]="60">
          <section class="card-cp p-4">
            <h3 class="display" style="font-size:1.2rem;margin:0 0 16px">
              <i class="bi bi-person-bounding-box"></i> Composition corporelle
            </h3>
            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <div class="cp-field">
                  <span class="cp-field-label">Date</span>
                  <input class="cp-field-input" type="date" [(ngModel)]="entry.date">
                </div>
              </div>
              <div class="col-md-4">
                <div class="cp-field">
                  <span class="cp-field-label">Poids (kg)</span>
                  <input class="cp-field-input" type="number" step="0.1" [(ngModel)]="entry.weightKg">
                </div>
              </div>
              <div class="col-md-4">
                <div class="cp-field">
                  <span class="cp-field-label">% MG</span>
                  <input class="cp-field-input" type="number" step="0.1" [(ngModel)]="entry.bodyFatPct">
                </div>
              </div>
            </div>
            <button class="btn-cp btn-primary-cp" (click)="addEntry()" style="width:100%;justify-content:center">Enregistrer</button>

            <div style="height:1px;background:var(--line);margin:20px 0"></div>

            <div *ngIf="entries.length === 0" style="color:var(--muted);text-align:center;padding:1.5rem 0;font-size:.85rem">
              Aucune entrée encore.
            </div>
            <div *ngFor="let e of entries.slice().reverse().slice(0, 5)" class="d-flex justify-content-between py-2"
                 style="border-bottom:1px solid var(--line);font-size:.9rem">
              <span class="mono" style="color:var(--muted)">{{ e.date }}</span>
              <span><strong>{{ e.weightKg }} kg</strong> <span style="color:var(--muted)" *ngIf="e.bodyFatPct"> &middot; {{ e.bodyFatPct }}%</span></span>
            </div>
          </section>
        </div>

        <!-- Sessions -->
        <div class="col-lg-6" [cpReveal]="120">
          <section class="card-cp p-4">
            <h3 class="display" style="font-size:1.2rem;margin:0 0 16px">
              <i class="bi bi-lightning-charge-fill"></i> Nouvelle séance
            </h3>
            <div class="row g-2 mb-3">
              <div class="col-12">
                <div class="cp-field">
                  <span class="cp-field-label">Activité</span>
                  <input class="cp-field-input" [(ngModel)]="metric.activity" placeholder="Course, muscu, tennis...">
                </div>
              </div>
              <div class="col-md-4">
                <div class="cp-field">
                  <span class="cp-field-label">Minutes</span>
                  <input class="cp-field-input" type="number" [(ngModel)]="metric.minutes">
                </div>
              </div>
              <div class="col-md-4">
                <div class="cp-field">
                  <span class="cp-field-label">RPE (1-10)</span>
                  <input class="cp-field-input" type="number" min="1" max="10" [(ngModel)]="metric.rpe">
                </div>
              </div>
              <div class="col-md-4">
                <div class="cp-field">
                  <span class="cp-field-label">Distance (km)</span>
                  <input class="cp-field-input" type="number" step="0.1" [(ngModel)]="metric.distanceKm">
                </div>
              </div>
              <div class="col-md-6">
                <div class="cp-field">
                  <span class="cp-field-label">Calories</span>
                  <input class="cp-field-input" type="number" [(ngModel)]="metric.caloriesBurned">
                </div>
              </div>
              <div class="col-md-6">
                <div class="cp-field">
                  <span class="cp-field-label">Vitesse moy. (km/h)</span>
                  <input class="cp-field-input" type="number" step="0.1" [(ngModel)]="metric.avgSpeedKmh">
                </div>
              </div>
            </div>
            <button class="btn-cp btn-primary-cp" (click)="addMetric()" style="width:100%;justify-content:center">
              <i class="bi bi-plus-lg"></i> Enregistrer la séance
            </button>
            <p style="color:var(--muted);font-size:.78rem;margin:12px 0 0">
              <i class="bi bi-info-circle"></i> RPE &times; Minutes = charge. L'IA calcule l'ACWR automatiquement.
            </p>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class ProgressComponent implements OnInit {
  entries: ProgressEntry[] = [];
  risk: any;
  entry: Partial<ProgressEntry> = {};
  metric: Partial<PerformanceMetric> = {};
  constructor(private cs: CoachingService) {}
  ngOnInit() {
    this.cs.myProgress().subscribe(r => this.entries = r);
    this.cs.recovery().subscribe(r => this.risk = r);
  }
  addEntry() { this.cs.recordProgress(this.entry).subscribe(() => { this.entry = {}; this.cs.myProgress().subscribe(r => this.entries = r); }); }
  addMetric() {
    this.cs.recordPerformance(this.metric).subscribe(() => {
      this.metric = {};
      this.cs.recovery().subscribe(r => this.risk = r);
    });
  }
  riskLabel(l: string) {
    return l === 'LOW' ? 'Sous-charge' : l === 'OK' ? 'Charge optimale'
         : l === 'ELEVATED' ? 'Charge élevée' : l === 'HIGH' ? 'Risque blessure ⚠' : '—';
  }
}
