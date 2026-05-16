import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';

@Component({
  selector: 'app-hydration',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a><span>&#8250;</span><span>Hydratation</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Recovery</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Hydratation</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Loggez votre consommation d'eau et atteignez votre objectif quotidien.</p>
        </div>
      </div>
    </div>

    <div class="full" style="padding-top:24px;max-width:980px">
      <div class="row g-4 mb-4">
        <div class="col-md-7">
          <div class="card-cp p-4 h-100" [cpReveal]="0">
            <div class="eyebrow mb-3">Aujourd'hui</div>
            <div class="d-flex align-items-end gap-3 mb-3">
              <div class="display" style="font-size:4rem;line-height:1;color:var(--accent-deep)">{{ todayMl() }}</div>
              <div style="color:var(--muted);font-size:1rem;margin-bottom:.4rem">/ {{ goal }} ml</div>
            </div>
            <div style="background:var(--line);height:14px;border-radius:99px;overflow:hidden">
              <div style="height:100%;background:linear-gradient(90deg,#0EA5E9,#06B6D4);transition:width .4s ease"
                   [style.width]="progressPct() + '%'"></div>
            </div>
            <div style="color:var(--muted-2);margin-top:8px;font-size:.82rem">{{ progressPct() }}% de l'objectif</div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="card-cp p-4 h-100" [cpReveal]="60">
            <div class="eyebrow mb-3">Ajouter rapidement</div>
            <div class="d-flex gap-2 flex-wrap mb-3">
              <button class="btn-cp btn-ghost-cp" (click)="quickLog(250)">+ 250ml</button>
              <button class="btn-cp btn-ghost-cp" (click)="quickLog(500)">+ 500ml</button>
              <button class="btn-cp btn-ghost-cp" (click)="quickLog(750)">+ 750ml</button>
            </div>
            <div class="cp-field">
              <span class="cp-field-label">Objectif quotidien (ml)</span>
              <input class="cp-field-input" type="number" [(ngModel)]="goal">
            </div>
            <div class="cp-field" style="margin-top:12px">
              <span class="cp-field-label">Quantit&eacute; personnalis&eacute;e</span>
              <div class="d-flex gap-2">
                <input class="cp-field-input" type="number" [(ngModel)]="customMl" placeholder="ml">
                <button class="btn-cp btn-primary-cp" (click)="logCustom()">Logger</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="display mb-3" style="font-size:1.2rem" [cpReveal]="120">7 derniers jours</h3>
      <div class="card-cp p-3" [cpReveal]="140">
        <div class="d-flex gap-3 align-items-end" style="height:160px;padding:0 .5rem">
          <div *ngFor="let l of logs" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:.5rem;height:100%">
            <div class="mono" style="font-size:.7rem;color:var(--muted)">{{ l.ml || 0 }}</div>
            <div [style.height.%]="barHeight(l)" style="width:80%;background:linear-gradient(180deg,#06B6D4,#0EA5E9);border-radius:6px 6px 0 0;min-height:4px"></div>
            <div class="mono" style="font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">{{ formatDay(l.date) }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HydrationComponent implements OnInit {
  goal = 2500;
  customMl = 200;
  logs: any[] = [];
  constructor(private cs: CoachingService) {}

  ngOnInit() { this.refresh(); }

  refresh() {
    const today = new Date(); const from = new Date(); from.setDate(today.getDate() - 6);
    this.cs.hydrationRange(this.fmt(from), this.fmt(today)).subscribe(r => {
      // pad with empty days
      const days: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(today.getDate() - i);
        const key = this.fmt(d);
        days.push(r?.find((l: any) => l.date === key) || { date: key, ml: 0, goalMl: this.goal });
      }
      this.logs = days;
    });
  }

  quickLog(ml: number) { this.cs.logHydration(ml, this.goal).subscribe(() => this.refresh()); }
  logCustom() { if (this.customMl > 0) this.cs.logHydration(this.customMl, this.goal).subscribe(() => this.refresh()); }

  todayMl() {
    const today = this.fmt(new Date());
    return this.logs.find(l => l.date === today)?.ml || 0;
  }
  progressPct() { return Math.min(100, Math.round((this.todayMl() / this.goal) * 100)); }
  barHeight(l: any) { return Math.min(100, ((l.ml || 0) / this.goal) * 100); }
  fmt(d: Date) { return d.toISOString().slice(0, 10); }
  formatDay(d: string) {
    const date = new Date(d);
    return ['DIM','LUN','MAR','MER','JEU','VEN','SAM'][date.getDay()];
  }
}
