import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { CoachingProgram } from '../../../Core/Models/Coaching/Coaching';

@Component({
  selector: 'app-coaching-programs',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a><span>&#8250;</span><span>Programmes</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Entra&icirc;nement</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Mes programmes</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Programmes assign&eacute;s ou cr&eacute;&eacute;s. Suivez votre semaine et marquez les s&eacute;ances effectu&eacute;es.</p>
        </div>
        <button class="btn-cp btn-primary-cp" routerLink="/coaching/ai"><i class="bi bi-stars"></i> G&eacute;n&eacute;rer avec l'IA</button>
      </div>
    </div>

    <div class="full" style="padding-top:24px">
      <div style="display:flex;gap:4px;margin-bottom:28px" [cpReveal]="0">
        <button class="btn-cp" [ngClass]="tab==='client' ? 'btn-dark-cp' : 'btn-ghost-cp'" (click)="tab='client';load()">
          <i class="bi bi-person"></i> En tant que client
        </button>
        <button class="btn-cp" [ngClass]="tab==='coach' ? 'btn-dark-cp' : 'btn-ghost-cp'" (click)="tab='coach';load()">
          <i class="bi bi-mortarboard"></i> En tant que coach
        </button>
      </div>

      <div class="cp-empty" *ngIf="programs.length === 0" [cpReveal]="50">
        <i class="bi bi-card-checklist"></i>
        <h4>Aucun programme</h4>
        <p>{{ tab === 'client' ? "Demandez &agrave; un coach ou g&eacute;n&eacute;rez-en un avec l'IA." : "Cr&eacute;ez votre premier programme pour vos athl&egrave;tes." }}</p>
        <button class="btn-cp btn-primary-cp" routerLink="/coaching/ai">G&eacute;n&eacute;rer un programme IA</button>
      </div>

      <div *ngFor="let p of programs; let i = index" class="card-cp p-4 mb-4" [cpReveal]="i * 60">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
              <span class="badge-cp" [ngClass]="badgeClass(p.status)">{{ statusLabel(p.status) }}</span>
              <span class="badge-cp" *ngIf="p.objective">{{ p.objective }}</span>
              <span class="badge-cp" *ngIf="p.level">{{ p.level }}</span>
              <span class="badge-cp" style="background:rgba(0,230,118,.14);color:var(--accent-deep)" *ngIf="p.aiGenerated"><i class="bi bi-stars"></i> IA</span>
            </div>
            <h3 class="display" style="font-size:24px;line-height:1.1">{{ p.title }}</h3>
            <p style="color:var(--muted);margin:8px 0 0;font-size:.9rem">{{ p.description }}</p>
          </div>
          <div style="text-align:right">
            <div class="display" style="font-size:2rem">{{ p.durationWeeks }}</div>
            <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">SEMAINES</div>
          </div>
        </div>

        <div style="border-top:1px solid var(--line);margin:16px 0"></div>

        <details *ngFor="let w of p.weeklyPlan; let wi = index" style="margin-bottom:8px">
          <summary style="cursor:pointer;padding:12px 16px;background:var(--cream-2);border-radius:var(--radius);font-weight:600;font-size:.9rem;list-style:none;display:flex;justify-content:space-between;align-items:center">
            <span><i class="bi bi-chevron-right" style="margin-right:8px"></i> Semaine {{ w.weekNumber }}</span>
            <span style="font-size:.78rem;font-weight:400;color:var(--muted)">{{ w.focus }}</span>
          </summary>
          <div style="padding:12px 0">
            <div *ngFor="let d of w.days; let di = index" class="card-cp mb-2 p-3" style="box-shadow:none">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <div>
                  <span class="mono" style="font-size:11px;letter-spacing:.14em;color:var(--muted)">{{ d.dayOfWeek }}</span>
                  <div style="font-weight:600;font-size:1rem">{{ d.title }}</div>
                </div>
                <button class="btn-cp btn-primary-cp btn-sm-cp" *ngIf="!d.completed" (click)="complete(p, wi, di)">
                  <i class="bi bi-check-lg"></i> Marquer fait
                </button>
                <span *ngIf="d.completed" class="badge-cp" style="background:rgba(0,230,118,.14);color:var(--accent-deep)">
                  <i class="bi bi-check-circle-fill"></i> Effectu&eacute;
                </span>
              </div>
              <ul style="margin:0;padding-left:1.2rem;font-size:.85rem;color:var(--muted-2);line-height:1.7">
                <li *ngFor="let ex of d.exercises">
                  <strong style="color:var(--ink)">{{ ex.name }}</strong>
                  <span class="mono" style="font-size:.8rem"> &middot; {{ ex.sets }}&times;{{ ex.reps }}
                    <span *ngIf="ex.restSec"> &middot; repos {{ ex.restSec }}s</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  `,
})
export class ProgramsComponent implements OnInit {
  tab: 'client' | 'coach' = 'client';
  programs: CoachingProgram[] = [];
  constructor(private cs: CoachingService) {}
  ngOnInit() { this.load(); }
  load() {
    const obs = this.tab === 'client' ? this.cs.programsAsClient() : this.cs.programsAsCoach();
    obs.subscribe(r => this.programs = r);
  }
  complete(p: CoachingProgram, week: number, day: number) {
    this.cs.completeDay(p.programId!, week, day).subscribe(() => this.load());
  }
  statusLabel(s?: string) {
    return s === 'ACTIVE' ? 'Actif' : s === 'DRAFT' ? 'Brouillon'
         : s === 'COMPLETED' ? 'Termin\u00e9' : s === 'ARCHIVED' ? 'Archiv\u00e9' : s;
  }
  badgeClass(s?: string) {
    return s === 'ACTIVE' ? 'style="background:rgba(0,230,118,.14);color:var(--accent-deep)"' : '';
  }
}
