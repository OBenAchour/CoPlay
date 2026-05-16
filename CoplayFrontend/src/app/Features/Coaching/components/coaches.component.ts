import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { CoachProfile } from '../../../Core/Models/Coaching/Coaching';

@Component({
  selector: 'app-coaches',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a><span>&#8250;</span><span>Coaches</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Annuaire</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Trouvez votre coach</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Coaches certifi&eacute;s, v&eacute;rifi&eacute;s. Filtrez par sp&eacute;cialit&eacute;.</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:.88rem">
            <input type="checkbox" [(ngModel)]="verifiedOnly" (change)="load()">
            <span><i class="bi bi-patch-check-fill" style="color:var(--accent)"></i> V&eacute;rifi&eacute;s uniquement</span>
          </label>
          <button class="btn-cp btn-primary-cp" (click)="showForm = !showForm">
            <i class="bi bi" [class.bi-plus-lg]="!showForm" [class.bi-x-lg]="showForm"></i>
            {{ showForm ? 'Annuler' : 'Devenir coach' }}
          </button>
        </div>
      </div>
    </div>

    <div class="full" style="padding-top:24px">
      <!-- Success message -->
      <div *ngIf="saved" class="card-cp p-3 mb-4" style="border-left:4px solid var(--accent);background:rgba(0,230,118,.06);display:flex;align-items:center;gap:12px">
        <i class="bi bi-check-circle-fill" style="font-size:1.3rem;color:var(--accent)"></i>
        <div style="font-size:.9rem;flex:1">
          <strong style="color:var(--accent-deep)">Profil coach cr&eacute;&eacute; avec succ&egrave;s !</strong>
          <span style="color:var(--muted)"> Il sera visible apr&egrave;s v&eacute;rification par un administrateur.</span>
        </div>
      </div>

      <!-- Error message -->
      <div *ngIf="errorMsg" class="card-cp p-3 mb-4" style="border-left:4px solid var(--danger);background:rgba(240,90,90,.06);display:flex;align-items:center;gap:12px">
        <i class="bi bi-exclamation-triangle-fill" style="font-size:1.3rem;color:var(--danger)"></i>
        <div style="font-size:.9rem;color:var(--danger)">{{ errorMsg }}</div>
      </div>

      <!-- Coach creation form -->
      <section *ngIf="showForm" class="card-cp p-4 mb-4" style="border:2px solid var(--accent)" [cpReveal]="0">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <div class="tile-icon" style="background:var(--accent);color:var(--navy)"><i class="bi bi-mortarboard"></i></div>
          <div>
            <h3 class="display" style="font-size:24px;margin:0">Cr&eacute;er mon profil coach</h3>
            <p style="color:var(--muted);margin:4px 0 0;font-size:13px">Partagez votre expertise et aidez des athl&egrave;tes &agrave; progresser.</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="cp-field" style="grid-column:span 2">
            <span class="cp-field-label">Bio</span>
            <textarea class="cp-field-input" [(ngModel)]="form.bio" rows="3"
                      placeholder="D&eacute;crivez votre approche, votre exp&eacute;rience, votre philosophie d'entra&icirc;nement..."
                      style="resize:vertical;min-height:80px"></textarea>
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Sp&eacute;cialit&eacute;s (s&eacute;par&eacute;es par virgule)</span>
            <input class="cp-field-input" [ngModel]="form.specialties?.join(', ')"
                   (ngModelChange)="form.specialties = splitList($event)"
                   placeholder="Football, Fitness, R&eacute;cup&eacute;ration...">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Ville</span>
            <input class="cp-field-input" [(ngModel)]="form.city" placeholder="Paris, Lyon...">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Ann&eacute;es d'exp&eacute;rience</span>
            <input class="cp-field-input" type="number" [(ngModel)]="form.yearsExperience" min="0" max="50">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Tarif horaire (&euro;)</span>
            <input class="cp-field-input" type="number" [(ngModel)]="form.hourlyRate" min="0" placeholder="50">
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:20px">
          <button class="btn-cp btn-primary-cp" (click)="createProfile()" [disabled]="saving">
            <span *ngIf="saving"><span class="live-dot"></span> Enregistrement&hellip;</span>
            <span *ngIf="!saving"><i class="bi bi-check-lg"></i> Cr&eacute;er mon profil</span>
          </button>
          <button class="btn-cp btn-ghost-cp" (click)="showForm = false">Annuler</button>
        </div>
      </section>

      <!-- Coaches list -->
      <div [cpReveal]="0" style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="badge-cp"><span class="live-dot"></span> {{ coaches.length }} coach{{ coaches.length !== 1 ? 'es' : '' }} disponible{{ coaches.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <div class="cp-empty" *ngIf="coaches.length === 0 && !showForm" [cpReveal]="60">
        <i class="bi bi-people"></i>
        <h4>Aucun coach disponible</h4>
        <p>Soyez le premier &agrave; proposer vos services !</p>
        <button class="btn-cp btn-primary-cp" (click)="showForm = true">
          <i class="bi bi-plus-lg"></i> Devenir coach
        </button>
      </div>

      <div class="row" *ngIf="coaches.length > 0">
        <div *ngFor="let c of coaches; let i = index" class="col-lg-4 col-md-6 mb-4" [cpReveal]="i * 45">
          <article class="card-cp p-4" style="height:100%;display:flex;flex-direction:column">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--ink),var(--ink-2));display:grid;place-items:center;color:var(--accent);font-family:var(--font-display);font-size:1.2rem">
                  {{ initials(c.userId) }}
                </div>
                <div>
                  <div style="font-weight:700;color:var(--ink)">{{ c.userId }}</div>
                  <div style="font-size:.78rem;color:var(--muted)">
                    <span *ngIf="c.yearsExperience">{{ c.yearsExperience }} ans d'exp&eacute;rience</span>
                    <span *ngIf="c.city"> &middot; {{ c.city }}</span>
                  </div>
                </div>
              </div>
              <span *ngIf="c.verified" class="badge-cp" style="font-size:.65rem;background:rgba(0,230,118,.14);color:var(--accent-deep)">
                <i class="bi bi-patch-check-fill"></i> V&eacute;rifi&eacute;
              </span>
            </div>

            <p style="font-size:.88rem;line-height:1.5;min-height:2.5rem;color:var(--muted-2);flex:1">
              {{ c.bio || 'Pas de bio disponible.' }}
            </p>

            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px" *ngIf="c.specialties?.length">
              <span class="badge-cp" *ngFor="let s of (c.specialties || []).slice(0,3)">{{ s }}</span>
            </div>

            <div style="border-top:1px solid var(--line);margin:4px 0 12px"></div>

            <div style="display:flex;justify-content:space-between;align-items:flex-end">
              <div>
                <div class="display" style="font-size:1.3rem">{{ c.hourlyRate || '—' }} &euro;<span class="mono" style="font-size:.72rem;color:var(--muted)">/h</span></div>
                <div *ngIf="c.rating" style="display:flex;align-items:center;gap:4px;font-size:.82rem;margin-top:2px">
                  <i class="bi bi-star-fill" style="color:var(--warning)"></i>
                  <strong>{{ c.rating | number:'1.1-1' }}</strong>
                  <span style="color:var(--muted)">({{ c.reviewCount || 0 }})</span>
                </div>
              </div>
              <button class="btn-cp btn-primary-cp btn-sm-cp" [routerLink]="['/coaching/coaches', c.coachProfileId || c.userId]">Voir profil</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  `,
})
export class CoachesComponent implements OnInit {
  coaches: CoachProfile[] = [];
  verifiedOnly = false;
  showForm = false;
  saving = false;
  saved = false;
  errorMsg = '';
  form: any = { specialties: [] };

  constructor(private cs: CoachingService) {}

  ngOnInit() { this.load(); }

  load() {
    this.cs.listCoaches(this.verifiedOnly).subscribe(p => this.coaches = p?.content || []);
  }

  createProfile() {
    this.saving = true;
    this.errorMsg = '';
    this.saved = false;
    this.cs.upsertCoachProfile(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        this.showForm = false;
        this.form = { specialties: [] };
        this.load();
        setTimeout(() => this.saved = false, 6000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Erreur lors de la cr\u00e9ation du profil. V\u00e9rifiez que vous \u00eates connect\u00e9.';
      },
    });
  }

  initials(id?: string) { return (id || '?').slice(0, 2).toUpperCase(); }

  splitList(value: string): string[] {
    return (value || '').split(',').map(x => x.trim()).filter(x => x.length > 0);
  }
}
