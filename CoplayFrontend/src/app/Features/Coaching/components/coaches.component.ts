import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { CoachProfile } from '../../../Core/Models/Coaching/Coaching';
import { AuthService } from '../../../Core/Services/Auth/auth.service';

const CERT_TYPES = [
  'UEFA Pro', 'UEFA A', 'UEFA B', 'UEFA C',
  'BPJEPS', 'DEJEPS', 'DESJEPS',
  'FFF (Football)', 'FFBB (Basketball)', 'FFT (Tennis)', 'FFA (Athlétisme)',
  'FIFPro', 'CAF (Confédération Africaine)', 'Autre'
];

const SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Padel', 'Volleyball',
  'Rugby', 'Handball', 'Fitness', 'Natation', 'Athlétisme', 'Autre'
];

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
            Coaches certifiés, vérifiés par notre équipe avant publication.</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:.88rem">
            <input type="checkbox" [(ngModel)]="verifiedOnly" (change)="load()">
            <span><i class="bi bi-patch-check-fill" style="color:var(--accent)"></i> Vérifiés uniquement</span>
          </label>
          <button class="btn-cp btn-primary-cp" *ngIf="!myProfile" (click)="showForm = !showForm">
            <i class="bi" [class.bi-plus-lg]="!showForm" [class.bi-x-lg]="showForm"></i>
            {{ showForm ? 'Annuler' : 'Devenir coach' }}
          </button>
        </div>
      </div>
    </div>

    <div class="full" style="padding-top:24px">

      <!-- ── Statut de la demande de l'utilisateur ── -->
      <div *ngIf="myProfile" class="card-cp p-4 mb-4" [ngStyle]="statusCardStyle(myProfile.status)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:14px">
            <i class="bi" style="font-size:1.8rem" [ngClass]="statusIcon(myProfile.status)"></i>
            <div>
              <div style="font-weight:700;font-size:1rem">{{ statusTitle(myProfile.status) }}</div>
              <div style="font-size:.85rem;color:var(--muted);margin-top:2px">{{ statusDesc(myProfile.status) }}</div>
              <div *ngIf="myProfile.status === 'REJECTED' && myProfile.rejectionReason"
                   style="margin-top:6px;font-size:.83rem;padding:6px 10px;background:rgba(240,90,90,.1);
                          border-radius:6px;color:var(--danger)">
                <strong>Motif :</strong> {{ myProfile.rejectionReason }}
              </div>
            </div>
          </div>
          <button *ngIf="myProfile.status === 'REJECTED'"
                  class="btn-cp btn-primary-cp btn-sm-cp"
                  (click)="myProfile = null; showForm = true">
            <i class="bi bi-arrow-repeat"></i> Re-soumettre
          </button>
        </div>
      </div>

      <!-- ── Panel admin : demandes en attente ── -->
      <section *ngIf="isAdmin && pendingCoaches.length > 0"
               class="card-cp p-4 mb-5" style="border:2px solid var(--warning)" [cpReveal]="0">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <div class="tile-icon" style="background:var(--warning);color:#000">
            <i class="bi bi-shield-check"></i>
          </div>
          <div>
            <h3 class="display" style="font-size:1.3rem;margin:0">
              Demandes en attente
              <span class="badge-cp"
                    style="background:rgba(245,158,11,.18);color:var(--warning);margin-left:8px">
                {{ pendingCoaches.length }}
              </span>
            </h3>
            <p style="color:var(--muted);margin:4px 0 0;font-size:.83rem">
              Examinez les certifications et approuvez ou rejetez chaque demande.
            </p>
          </div>
        </div>

        <div *ngFor="let p of pendingCoaches"
             class="card-cp p-3 mb-3" style="box-shadow:none;border:1px solid var(--line)">
          <div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start">
            <div>
              <div style="font-weight:700;margin-bottom:6px">{{ p.displayName || p.userId }}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                <span class="badge-cp" *ngIf="p.sportMain">
                  <i class="bi bi-dribbble"></i> {{ p.sportMain }}
                </span>
                <span class="badge-cp" *ngIf="p.certifications?.[0]">
                  <i class="bi bi-award"></i> {{ p.certifications![0].name }}
                </span>
                <span class="badge-cp" *ngIf="p.certifications?.[0]?.licenseNumber"
                      style="font-family:monospace;font-size:.75rem">
                  N° {{ p.certifications![0].licenseNumber }}
                </span>
                <span class="badge-cp" *ngIf="p.certifications?.[0]?.issuer">
                  {{ p.certifications![0].issuer }}
                </span>
                <span class="badge-cp" *ngIf="p.certifications?.[0]?.year">
                  {{ p.certifications![0].year }}
                </span>
              </div>
              <div style="font-size:.83rem;color:var(--muted-2)" *ngIf="p.bio">
                {{ p.bio | slice:0:140 }}…
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;min-width:145px">
              <button class="btn-cp btn-primary-cp btn-sm-cp"
                      [disabled]="processingId === p.coachProfileId"
                      (click)="approve(p)">
                <i class="bi bi-check-lg"></i> Approuver
              </button>

              <div *ngIf="rejectingId !== p.coachProfileId">
                <button class="btn-cp btn-ghost-cp btn-sm-cp"
                        style="width:100%;color:var(--danger);border-color:var(--danger)"
                        (click)="rejectingId = p.coachProfileId!; rejectReason = ''">
                  <i class="bi bi-x-lg"></i> Rejeter
                </button>
              </div>

              <div *ngIf="rejectingId === p.coachProfileId"
                   style="display:flex;flex-direction:column;gap:6px">
                <input class="cp-field-input" [(ngModel)]="rejectReason"
                       placeholder="Motif obligatoire…"
                       style="font-size:.8rem;padding:5px 8px">
                <div style="display:flex;gap:6px">
                  <button class="btn-cp btn-ghost-cp btn-sm-cp"
                          style="flex:1;color:var(--danger);border-color:var(--danger)"
                          [disabled]="!rejectReason.trim() || processingId === p.coachProfileId"
                          (click)="reject(p)">
                    Confirmer
                  </button>
                  <button class="btn-cp btn-ghost-cp btn-sm-cp"
                          (click)="rejectingId = ''; rejectReason = ''">
                    Ann.
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Toasts ── -->
      <div *ngIf="saved" class="card-cp p-3 mb-4"
           style="border-left:4px solid var(--accent);background:rgba(0,230,118,.06);
                  display:flex;align-items:center;gap:12px">
        <i class="bi bi-send-check-fill" style="font-size:1.3rem;color:var(--accent)"></i>
        <div style="font-size:.9rem;flex:1">
          <strong style="color:var(--accent-deep)">Demande envoyée !</strong>
          <span style="color:var(--muted)">
            Notre équipe va examiner votre dossier. Vous serez notifié du résultat.
          </span>
        </div>
      </div>

      <div *ngIf="errorMsg" class="card-cp p-3 mb-4"
           style="border-left:4px solid var(--danger);background:rgba(240,90,90,.06);
                  display:flex;align-items:center;gap:12px">
        <i class="bi bi-exclamation-triangle-fill" style="font-size:1.3rem;color:var(--danger)"></i>
        <div style="font-size:.9rem;color:var(--danger)">{{ errorMsg }}</div>
      </div>

      <!-- ── Formulaire demande coach ── -->
      <section *ngIf="showForm" class="card-cp p-4 mb-5"
               style="border:2px solid var(--accent)" [cpReveal]="0">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
          <div class="tile-icon" style="background:var(--accent);color:var(--navy)">
            <i class="bi bi-mortarboard"></i>
          </div>
          <div>
            <h3 class="display" style="font-size:1.4rem;margin:0">Demande de profil coach</h3>
            <p style="color:var(--muted);margin:4px 0 0;font-size:.83rem">
              Tous les champs marqués <span style="color:var(--danger)">*</span> sont obligatoires.
              Votre dossier sera examiné avant publication.
            </p>
          </div>
        </div>

        <!-- Section Certification -->
        <div style="margin:20px 0 14px;display:flex;align-items:center;gap:10px">
          <div style="flex:1;height:1px;background:var(--line)"></div>
          <span style="font-size:.72rem;font-weight:700;letter-spacing:.1em;color:var(--muted);text-transform:uppercase">
            <i class="bi bi-award"></i> Certification professionnelle
          </span>
          <div style="flex:1;height:1px;background:var(--line)"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="cp-field">
            <span class="cp-field-label">Sport principal <span style="color:var(--danger)">*</span></span>
            <select class="cp-field-input" [(ngModel)]="form.sportMain">
              <option value="">-- Sélectionner --</option>
              <option *ngFor="let s of sports" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Type de certification <span style="color:var(--danger)">*</span></span>
            <select class="cp-field-input" [(ngModel)]="form.certType">
              <option value="">-- Sélectionner --</option>
              <option *ngFor="let c of certTypes" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Numéro de licence <span style="color:var(--danger)">*</span></span>
            <input class="cp-field-input" [(ngModel)]="form.licenseNumber"
                   placeholder="Ex : UEFA-FR-2019-04821"
                   style="font-family:monospace;letter-spacing:.04em">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Organisme émetteur <span style="color:var(--danger)">*</span></span>
            <input class="cp-field-input" [(ngModel)]="form.certIssuer"
                   placeholder="Ex : UEFA, Fédération Française de Football…">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Année d'obtention <span style="color:var(--danger)">*</span></span>
            <input class="cp-field-input" type="number" [(ngModel)]="form.certYear"
                   [min]="1970" [max]="currentYear" [placeholder]="currentYear">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Années d'expérience</span>
            <input class="cp-field-input" type="number" [(ngModel)]="form.yearsExperience"
                   min="0" max="50" placeholder="0">
          </div>
        </div>

        <!-- Section Profil public -->
        <div style="margin:20px 0 14px;display:flex;align-items:center;gap:10px">
          <div style="flex:1;height:1px;background:var(--line)"></div>
          <span style="font-size:.72rem;font-weight:700;letter-spacing:.1em;color:var(--muted);text-transform:uppercase">
            <i class="bi bi-person-lines-fill"></i> Profil public
          </span>
          <div style="flex:1;height:1px;background:var(--line)"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="cp-field" style="grid-column:span 2">
            <span class="cp-field-label">Bio <span style="color:var(--danger)">*</span></span>
            <textarea class="cp-field-input" [(ngModel)]="form.bio" rows="3"
                      placeholder="Décrivez votre approche, votre expérience, votre philosophie d'entraînement…"
                      style="resize:vertical;min-height:80px"></textarea>
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Spécialités (séparées par virgule)</span>
            <input class="cp-field-input"
                   [ngModel]="form.specialties?.join(', ')"
                   (ngModelChange)="form.specialties = splitList($event)"
                   placeholder="Fitness, Récupération, Préparation physique…">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Ville</span>
            <input class="cp-field-input" [(ngModel)]="form.city" placeholder="Tunis, Sfax…">
          </div>

          <div class="cp-field">
            <span class="cp-field-label">Tarif horaire (€)</span>
            <input class="cp-field-input" type="number" [(ngModel)]="form.hourlyRate"
                   min="0" placeholder="50">
          </div>
        </div>

        <!-- Attestation sur l'honneur -->
        <label style="display:flex;align-items:flex-start;gap:10px;margin-top:20px;cursor:pointer;
                      padding:14px 16px;border-radius:10px;border:1.5px solid;transition:border-color .2s,background .2s"
               [style.border-color]="form.attested ? 'var(--accent)' : 'var(--line)'"
               [style.background]="form.attested ? 'rgba(0,230,118,.06)' : 'transparent'">
          <input type="checkbox" [(ngModel)]="form.attested"
                 style="margin-top:3px;accent-color:var(--accent);width:16px;height:16px;flex-shrink:0">
          <div style="font-size:.85rem;line-height:1.55;color:var(--muted-2)">
            <strong style="color:var(--ink)">J'atteste sur l'honneur</strong>
            que les informations fournies (certification, numéro de licence, organisme) sont exactes et authentiques.
            Je comprends que toute fausse déclaration entraînera le rejet définitif de ma demande.
          </div>
        </label>

        <!-- Erreurs de validation -->
        <div *ngIf="formErrors.length"
             style="margin-top:14px;padding:10px 14px;background:rgba(240,90,90,.08);
                    border-radius:8px;border-left:3px solid var(--danger)">
          <div *ngFor="let e of formErrors"
               style="font-size:.83rem;color:var(--danger);margin-bottom:3px">
            <i class="bi bi-exclamation-circle"></i> {{ e }}
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:20px">
          <button class="btn-cp btn-primary-cp" (click)="createProfile()" [disabled]="saving">
            <span *ngIf="saving"><span class="live-dot"></span> Envoi en cours…</span>
            <span *ngIf="!saving"><i class="bi bi-send"></i> Soumettre ma demande</span>
          </button>
          <button class="btn-cp btn-ghost-cp"
                  (click)="showForm = false; formErrors = []">Annuler</button>
        </div>
      </section>

      <!-- ── Liste coaches approuvés ── -->
      <div [cpReveal]="0"
           style="display:flex;align-items:center;justify-content:space-between;
                  margin-bottom:24px;gap:16px;flex-wrap:wrap">
        <span class="badge-cp">
          <span class="live-dot"></span>
          {{ coaches.length }} coach{{ coaches.length !== 1 ? 'es' : '' }}
          disponible{{ coaches.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <div class="cp-empty" *ngIf="coaches.length === 0 && !showForm" [cpReveal]="60">
        <i class="bi bi-people"></i>
        <h4>Aucun coach disponible</h4>
        <p>Soyez le premier à proposer vos services !</p>
        <button class="btn-cp btn-primary-cp" *ngIf="!myProfile" (click)="showForm = true">
          <i class="bi bi-plus-lg"></i> Devenir coach
        </button>
      </div>

      <div class="row" *ngIf="coaches.length > 0">
        <div *ngFor="let c of coaches; let i = index"
             class="col-lg-4 col-md-6 mb-4" [cpReveal]="i * 45">
          <article class="card-cp p-4" style="height:100%;display:flex;flex-direction:column">

            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="width:54px;height:54px;border-radius:50%;
                            background:linear-gradient(135deg,var(--ink),var(--ink-2));
                            display:grid;place-items:center;color:var(--accent);
                            font-family:var(--font-display);font-size:1.2rem">
                  {{ initials(c.displayName || c.userId) }}
                </div>
                <div>
                  <div style="font-weight:700;color:var(--ink)">{{ c.displayName || c.userId }}</div>
                  <div style="font-size:.78rem;color:var(--muted)">
                    <span *ngIf="c.sportMain">
                      <i class="bi bi-dribbble" style="font-size:.7rem"></i> {{ c.sportMain }}
                    </span>
                    <span *ngIf="c.yearsExperience"> · {{ c.yearsExperience }} ans d'exp</span>
                    <span *ngIf="c.city"> · {{ c.city }}</span>
                  </div>
                </div>
              </div>
              <span class="badge-cp"
                    style="font-size:.65rem;background:rgba(0,230,118,.14);
                           color:var(--accent-deep);white-space:nowrap">
                <i class="bi bi-patch-check-fill"></i> Vérifié
              </span>
            </div>

            <!-- Badge certification -->
            <div *ngIf="c.certifications?.[0]"
                 style="margin-bottom:10px;display:flex;align-items:center;gap:6px;
                        padding:5px 10px;border-radius:6px;background:rgba(10,173,227,.08);
                        font-size:.78rem">
              <i class="bi bi-award-fill" style="color:var(--accent)"></i>
              <span style="font-weight:600">{{ c.certifications![0].name }}</span>
              <span style="color:var(--muted)">· {{ c.certifications![0].issuer }}</span>
            </div>

            <p style="font-size:.88rem;line-height:1.5;min-height:2.5rem;
                      color:var(--muted-2);flex:1">
              {{ c.bio || 'Pas de bio disponible.' }}
            </p>

            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px"
                 *ngIf="c.specialties?.length">
              <span class="badge-cp" *ngFor="let s of (c.specialties || []).slice(0,3)">{{ s }}</span>
            </div>

            <div style="border-top:1px solid var(--line);margin:4px 0 12px"></div>

            <div style="display:flex;justify-content:space-between;align-items:flex-end">
              <div>
                <div class="display" style="font-size:1.3rem">
                  {{ c.hourlyRate || '—' }}&nbsp;€
                  <span class="mono" style="font-size:.72rem;color:var(--muted)">/h</span>
                </div>
                <div *ngIf="c.rating"
                     style="display:flex;align-items:center;gap:4px;font-size:.82rem;margin-top:2px">
                  <i class="bi bi-star-fill" style="color:var(--warning)"></i>
                  <strong>{{ c.rating | number:'1.1-1' }}</strong>
                  <span style="color:var(--muted)">({{ c.reviewCount || 0 }})</span>
                </div>
              </div>
              <button class="btn-cp btn-primary-cp btn-sm-cp"
                      [routerLink]="['/coaching/coaches', c.coachProfileId || c.userId]">
                Voir profil
              </button>
            </div>

          </article>
        </div>
      </div>

    </div>
  `,
})
export class CoachesComponent implements OnInit {

  coaches: CoachProfile[]        = [];
  pendingCoaches: CoachProfile[] = [];
  myProfile: CoachProfile | null = null;

  verifiedOnly = false;
  showForm     = false;
  saving       = false;
  saved        = false;
  errorMsg     = '';
  formErrors: string[] = [];

  // Admin actions
  processingId = '';
  rejectingId  = '';
  rejectReason = '';

  readonly certTypes   = CERT_TYPES;
  readonly sports      = SPORTS;
  readonly currentYear = new Date().getFullYear();

  form: any = this.emptyForm();

  get isAdmin(): boolean { return this.auth.isAdmin(); }

  constructor(private cs: CoachingService, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
    this.loadMyProfile();
    if (this.isAdmin) this.loadPending();
  }

  load(): void {
    this.cs.listCoaches(this.verifiedOnly)
      .subscribe(p => this.coaches = p?.content ?? p ?? []);
  }

  loadMyProfile(): void {
    this.cs.myCoachProfile().subscribe({
      next:  p  => this.myProfile = p,
      error: () => this.myProfile = null
    });
  }

  loadPending(): void {
    this.cs.getPendingCoaches().subscribe({
      next:  p  => this.pendingCoaches = p ?? [],
      error: () => this.pendingCoaches = []
    });
  }

  // ── Validation ────────────────────────────────────────────────────
  validate(): boolean {
    this.formErrors = [];
    if (!this.form.sportMain)
      this.formErrors.push('Le sport principal est obligatoire.');
    if (!this.form.certType)
      this.formErrors.push('Le type de certification est obligatoire.');
    if (!this.form.licenseNumber?.trim())
      this.formErrors.push('Le numéro de licence est obligatoire.');
    if (!this.form.certIssuer?.trim())
      this.formErrors.push("L'organisme émetteur est obligatoire.");
    if (!this.form.certYear
        || this.form.certYear < 1970
        || this.form.certYear > this.currentYear)
      this.formErrors.push("L'année d'obtention est invalide.");
    if (!this.form.bio?.trim())
      this.formErrors.push('La bio est obligatoire.');
    if (!this.form.attested)
      this.formErrors.push("Vous devez cocher l'attestation sur l'honneur.");
    return this.formErrors.length === 0;
  }

  // ── Soumission ────────────────────────────────────────────────────
  createProfile(): void {
    if (!this.validate()) return;

    this.saving   = true;
    this.errorMsg = '';
    this.saved    = false;

    const payload: Partial<CoachProfile> = {
      sportMain      : this.form.sportMain,
      bio            : this.form.bio,
      specialties    : this.form.specialties,
      city           : this.form.city,
      hourlyRate     : this.form.hourlyRate   || undefined,
      yearsExperience: this.form.yearsExperience || undefined,
      certifications : [{
        name         : this.form.certType,
        issuer       : this.form.certIssuer,
        year         : Number(this.form.certYear),
        licenseNumber: this.form.licenseNumber.trim(),
        sport        : this.form.sportMain,
      }]
    };

    this.cs.upsertCoachProfile(payload).subscribe({
      next: p => {
        this.saving    = false;
        this.saved     = true;
        this.showForm  = false;
        this.myProfile = p;
        this.form      = this.emptyForm();
        setTimeout(() => this.saved = false, 8000);
      },
      error: () => {
        this.saving   = false;
        this.errorMsg = "Erreur lors de l'envoi. Vérifiez votre connexion et réessayez.";
      }
    });
  }

  // ── Actions admin ─────────────────────────────────────────────────
  approve(p: CoachProfile): void {
    this.processingId = p.coachProfileId!;
    this.cs.approveCoach(p.coachProfileId!).subscribe({
      next: () => {
        this.pendingCoaches = this.pendingCoaches.filter(x => x.coachProfileId !== p.coachProfileId);
        this.processingId   = '';
        this.load();
      },
      error: () => { this.processingId = ''; }
    });
  }

  reject(p: CoachProfile): void {
    if (!this.rejectReason.trim()) return;
    this.processingId = p.coachProfileId!;
    this.cs.rejectCoach(p.coachProfileId!, this.rejectReason.trim()).subscribe({
      next: () => {
        this.pendingCoaches = this.pendingCoaches.filter(x => x.coachProfileId !== p.coachProfileId);
        this.processingId   = '';
        this.rejectingId    = '';
        this.rejectReason   = '';
      },
      error: () => { this.processingId = ''; }
    });
  }

  // ── Helpers statut ────────────────────────────────────────────────
  statusIcon(s?: string): Record<string, boolean> {
    return {
      'bi-hourglass-split' : s === 'PENDING',
      'bi-patch-check-fill': s === 'APPROVED',
      'bi-x-circle-fill'   : s === 'REJECTED',
    };
  }

  statusTitle(s?: string): string {
    if (s === 'PENDING')  return "Demande en cours d'examen";
    if (s === 'APPROVED') return 'Profil coach approuvé ✓';
    if (s === 'REJECTED') return 'Demande rejetée';
    return '';
  }

  statusDesc(s?: string): string {
    if (s === 'PENDING')
      return "Notre équipe examine votre dossier. Vous serez notifié dès qu'une décision est prise.";
    if (s === 'APPROVED')
      return "Votre profil est visible dans l'annuaire. Vous pouvez maintenant créer des programmes.";
    if (s === 'REJECTED')
      return "Votre demande n'a pas été validée. Vous pouvez corriger et re-soumettre.";
    return '';
  }

  statusCardStyle(s?: string): Record<string, string> {
    if (s === 'PENDING')  return { 'border-left': '4px solid var(--warning)', background: 'rgba(245,158,11,.06)' };
    if (s === 'APPROVED') return { 'border-left': '4px solid var(--accent)',  background: 'rgba(0,230,118,.06)'  };
    if (s === 'REJECTED') return { 'border-left': '4px solid var(--danger)',  background: 'rgba(240,90,90,.06)'  };
    return {};
  }

  // ── Utilitaires ───────────────────────────────────────────────────
  initials(name?: string): string {
    return (name || '?').slice(0, 2).toUpperCase();
  }

  splitList(value: string): string[] {
    return (value || '').split(',').map(x => x.trim()).filter(Boolean);
  }

  private emptyForm(): any {
    return {
      sportMain: '', certType: '', licenseNumber: '', certIssuer: '', certYear: null,
      bio: '', specialties: [], city: '', hourlyRate: null, yearsExperience: null,
      attested: false
    };
  }
}
