import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { NutritionPlan } from '../../../Core/Models/Coaching/Coaching';

@Component({
  selector: 'app-nutrition',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a><span>&#8250;</span><span>Nutrition</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Performance &middot; Nutrition</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Plans nutrition</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Calories cibles, macros, repas types &mdash; adapt&eacute;s &agrave; votre profil et objectif.</p>
        </div>
      </div>
    </div>

    <div class="full" style="padding-top:24px">
      <section class="card-cp p-4 mb-4" style="border-color:var(--accent);background:linear-gradient(135deg,rgba(0,230,118,.08) 0%,white 60%)" [cpReveal]="0">
        <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px">
          <i class="bi bi-stars" style="font-size:2rem;color:var(--accent)"></i>
          <div>
            <h3 class="display" style="font-size:1.3rem;margin:0">G&eacute;n&eacute;ration IA</h3>
            <p style="color:var(--muted);margin:4px 0 0;font-size:.88rem">L'IA calcule votre TDEE et propose un plan personnalis&eacute;.</p>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-md-3">
            <div class="cp-field"><span class="cp-field-label">Poids (kg)</span>
              <input class="cp-field-input" type="number" [(ngModel)]="ai.weightKg"></div>
          </div>
          <div class="col-md-3">
            <div class="cp-field"><span class="cp-field-label">Taille (cm)</span>
              <input class="cp-field-input" type="number" [(ngModel)]="ai.heightCm"></div>
          </div>
          <div class="col-md-2">
            <div class="cp-field"><span class="cp-field-label">&Acirc;ge</span>
              <input class="cp-field-input" type="number" [(ngModel)]="ai.age"></div>
          </div>
          <div class="col-md-2">
            <div class="cp-field"><span class="cp-field-label">Sexe</span>
              <select class="cp-field-input" [(ngModel)]="ai.sex"><option>MALE</option><option>FEMALE</option></select></div>
          </div>
          <div class="col-md-2">
            <div class="cp-field"><span class="cp-field-label">Activit&eacute;</span>
              <select class="cp-field-input" [(ngModel)]="ai.activityLevel"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div>
          </div>
          <div class="col-md-6">
            <div class="cp-field"><span class="cp-field-label">Objectif</span>
              <select class="cp-field-input" [(ngModel)]="ai.objective">
                <option value="FAT_LOSS">Perte de gras</option>
                <option value="MUSCLE_GAIN">Prise de muscle</option>
                <option value="MAINTENANCE">Maintien</option>
                <option value="PERFORMANCE">Performance</option>
              </select></div>
          </div>
          <div class="col-md-6 d-flex align-items-end">
            <button class="btn-cp btn-primary-cp" style="width:100%;justify-content:center" (click)="gen()" [disabled]="loading">
              <i class="bi" [class.bi-stars]="!loading" [class.bi-hourglass-split]="loading"></i>
              {{ loading ? 'G\u00e9n\u00e9ration en cours...' : 'G\u00e9n\u00e9rer mon plan' }}
            </button>
          </div>
        </div>
      </section>

      <div class="cp-empty" *ngIf="plans.length === 0" [cpReveal]="60">
        <i class="bi bi-egg-fried"></i>
        <h4>Aucun plan nutrition</h4>
        <p>G&eacute;n&eacute;rez votre premier plan personnalis&eacute; avec l'IA.</p>
      </div>

      <div *ngFor="let p of plans; let i = index" class="card-cp p-4 mb-4" [cpReveal]="i * 60 + 80">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
              <span class="badge-cp" style="background:rgba(0,230,118,.14);color:var(--accent-deep)" *ngIf="p.aiGenerated"><i class="bi bi-stars"></i> IA</span>
              <span class="badge-cp">{{ objectiveLabel(p.objective) }}</span>
            </div>
            <h4 class="display" style="font-size:1.5rem;margin:0">{{ p.dailyCalories }} <small style="font-family:Manrope;font-size:.85rem;color:var(--muted)">kcal/jour</small></h4>
          </div>
          <button class="btn-cp btn-ghost-cp" style="color:var(--danger)" (click)="del(p)"><i class="bi bi-trash"></i></button>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-3">
            <div class="card-cp p-2 text-center" style="box-shadow:none">
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">PROT&Eacute;INES</div>
              <div class="display" style="font-size:1.4rem">{{ p.proteinsG }}<small style="font-size:.8rem">g</small></div>
            </div>
          </div>
          <div class="col-3">
            <div class="card-cp p-2 text-center" style="box-shadow:none">
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">GLUCIDES</div>
              <div class="display" style="font-size:1.4rem">{{ p.carbsG }}<small style="font-size:.8rem">g</small></div>
            </div>
          </div>
          <div class="col-3">
            <div class="card-cp p-2 text-center" style="box-shadow:none">
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">LIPIDES</div>
              <div class="display" style="font-size:1.4rem">{{ p.fatsG }}<small style="font-size:.8rem">g</small></div>
            </div>
          </div>
          <div class="col-3">
            <div class="card-cp p-2 text-center" style="box-shadow:none">
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">HYDRATATION</div>
              <div class="display" style="font-size:1.4rem">{{ p.hydrationGoalMl }}<small style="font-size:.8rem">ml</small></div>
            </div>
          </div>
        </div>

        <div *ngIf="p.meals?.length">
          <div class="eyebrow" style="margin-bottom:10px">Repas du jour</div>
          <div class="card-cp p-3 mb-2" *ngFor="let m of p.meals" style="box-shadow:none">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <strong>{{ m.name }}</strong>
                <span class="mono" style="font-size:.78rem;color:var(--muted);margin-left:8px">{{ m.calories }} kcal</span>
              </div>
            </div>
            <p style="color:var(--muted-2);margin:4px 0 0;font-size:.85rem">{{ m.description }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NutritionComponent implements OnInit {
  plans: NutritionPlan[] = [];
  loading = false;
  ai: any = { sex: 'MALE', activityLevel: 'MEDIUM', objective: 'MAINTENANCE' };
  constructor(private cs: CoachingService) {}
  ngOnInit() { this.load(); }
  load() { this.cs.myNutrition().subscribe(r => this.plans = r); }
  gen() {
    this.loading = true;
    this.cs.generateNutrition(this.ai).subscribe({ next: () => { this.loading = false; this.load(); }, error: () => this.loading = false });
  }
  del(p: NutritionPlan) { if (confirm('Supprimer ?')) this.cs.deleteNutrition(p.planId!).subscribe(() => this.load()); }
  objectiveLabel(o?: string) {
    return o === 'FAT_LOSS' ? 'Perte gras' : o === 'MUSCLE_GAIN' ? 'Muscle' : o === 'PERFORMANCE' ? 'Performance' : 'Maintien';
  }
}
