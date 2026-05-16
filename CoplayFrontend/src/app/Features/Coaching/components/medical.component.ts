import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { MedicalRecord } from '../../../Core/Models/Coaching/Coaching';

@Component({
  selector: 'app-medical',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a><span>&#8250;</span><span>Dossier m&eacute;dical</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Confidentiel &middot; Healthcare</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Dossier m&eacute;dical</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Vos donn&eacute;es de sant&eacute; sont strictement priv&eacute;es. Vous contr&ocirc;lez qui peut les consulter.</p>
        </div>
      </div>
    </div>

    <div class="full" style="padding-top:24px;max-width:880px">
      <!-- Success banner -->
      <div *ngIf="saved" class="card-cp p-3 mb-4" style="border-color:var(--accent);background:rgba(0,230,118,.08);display:flex;align-items:center;gap:12px" >
        <i class="bi bi-check-circle-fill" style="font-size:1.3rem;color:var(--accent)"></i>
        <div style="font-size:.9rem;flex:1">
          <strong style="color:var(--accent-deep)">Dossier enregistr&eacute; avec succ&egrave;s.</strong>
          <span style="color:var(--muted)"> Vos donn&eacute;es sont stock&eacute;es de mani&egrave;re s&eacute;curis&eacute;e.</span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-cp btn-primary-cp btn-sm-cp" routerLink="/coaching">
            <i class="bi bi-arrow-left"></i> Retour au coaching
          </button>
        </div>
      </div>

      <!-- Error banner -->
      <div *ngIf="errorMsg" class="card-cp p-3 mb-4" style="border-color:var(--danger);background:rgba(240,90,90,.08);display:flex;align-items:center;gap:12px" >
        <i class="bi bi-exclamation-triangle-fill" style="font-size:1.3rem;color:var(--danger)"></i>
        <div style="font-size:.9rem;color:var(--danger)">{{ errorMsg }}</div>
      </div>

      <div class="card-cp p-3 mb-4" style="border-color:var(--warning);background:rgba(245,158,11,.08);display:flex;align-items:center;gap:12px" [cpReveal]="0">
        <i class="bi bi-shield-lock-fill" style="font-size:1.5rem;color:var(--warning)"></i>
        <div style="font-size:.88rem">
          <strong>Donn&eacute;es sensibles.</strong> Stockage chiffr&eacute;, acc&egrave;s restreint au propri&eacute;taire et coaches autoris&eacute;s explicitement.
        </div>
      </div>

      <section class="card-cp p-4" [cpReveal]="60">
        <h3 class="display" style="font-size:1.2rem;margin-bottom:24px">Informations m&eacute;dicales</h3>

        <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:16px">
          <div style="grid-column:span 4" class="cp-field">
            <span class="cp-field-label">Groupe sanguin</span>
            <select class="cp-field-input" [(ngModel)]="record.bloodType">
              <option value="">&mdash;</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
            </select>
          </div>
          <div style="grid-column:span 8" class="cp-field">
            <span class="cp-field-label">Dernier check-up</span>
            <input class="cp-field-input" type="date" [(ngModel)]="record.lastCheckup">
          </div>

          <div style="grid-column:span 12" class="cp-field">
            <span class="cp-field-label">Allergies (s&eacute;par&eacute;es par virgule)</span>
            <input class="cp-field-input" [ngModel]="joinList(record.allergies)"
                   (ngModelChange)="record.allergies = splitList($event)"
                   placeholder="Pollen, arachides, ...">
          </div>

          <div style="grid-column:span 12" class="cp-field">
            <span class="cp-field-label">Conditions chroniques</span>
            <input class="cp-field-input" [ngModel]="joinList(record.chronicConditions)"
                   (ngModelChange)="record.chronicConditions = splitList($event)"
                   placeholder="Asthme, diab&egrave;te, ...">
          </div>

          <div style="grid-column:span 12" class="cp-field">
            <span class="cp-field-label">Traitements en cours</span>
            <input class="cp-field-input" [ngModel]="joinList(record.medications)"
                   (ngModelChange)="record.medications = splitList($event)"
                   placeholder="Ventoline, ...">
          </div>

          <div style="grid-column:span 12;border-top:1px solid var(--line);margin:4px 0"></div>

          <div style="grid-column:span 6" class="cp-field">
            <span class="cp-field-label">Contact d'urgence &mdash; nom</span>
            <input class="cp-field-input" [(ngModel)]="record.emergencyContactName">
          </div>
          <div style="grid-column:span 6" class="cp-field">
            <span class="cp-field-label">Contact d'urgence &mdash; t&eacute;l&eacute;phone</span>
            <input class="cp-field-input" [(ngModel)]="record.emergencyContactPhone">
          </div>
        </div>

        <div style="border-top:1px solid var(--line);margin:20px 0"></div>

        <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer">
          <input type="checkbox" [(ngModel)]="record.consent" style="margin-top:.3rem">
          <span style="font-size:.88rem;color:var(--muted)">
            Je consens au stockage chiffr&eacute; de ces donn&eacute;es et autorise leur consultation
            uniquement par les coaches que j'autorise explicitement.
          </span>
        </label>

        <button class="btn-cp btn-primary-cp" (click)="save()" [disabled]="!record.consent || saving"
                style="margin-top:20px;width:100%;justify-content:center">
          <span *ngIf="saving"><span class="live-dot"></span> Enregistrement&hellip;</span>
          <span *ngIf="!saving"><i class="bi bi-shield-check"></i> Enregistrer en s&eacute;curit&eacute;</span>
        </button>
      </section>

      <!-- Coach authorization section (only after save) -->
      <section *ngIf="record.recordId" class="card-cp p-4 mt-4" [cpReveal]="120">
        <h3 class="display" style="font-size:1.2rem;margin-bottom:8px">Acc&egrave;s coach</h3>
        <p style="color:var(--muted);font-size:14px;margin-bottom:16px">
          Autorisez un coach certifi&eacute; &agrave; consulter votre dossier pour adapter vos programmes.
        </p>

        <div style="display:flex;gap:8px;margin-bottom:16px">
          <input class="cp-field-input" [(ngModel)]="coachEmail" placeholder="Email ou ID du coach"
                 style="flex:1">
          <button class="btn-cp btn-primary-cp" (click)="authorizeCoach()" [disabled]="!coachEmail.trim()">
            <i class="bi bi-plus-lg"></i> Autoriser
          </button>
        </div>

        <div *ngIf="record.authorizedCoachIds && record.authorizedCoachIds.length > 0">
          <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted);margin-bottom:8px">COACHES AUTORIS&Eacute;S</div>
          <div *ngFor="let id of record.authorizedCoachIds" class="card-cp p-3 mb-2"
               style="display:flex;justify-content:space-between;align-items:center;box-shadow:none">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--ink);color:var(--accent);display:grid;place-items:center;font-family:var(--font-display);font-size:.9rem">
                {{ id.substring(0, 2).toUpperCase() }}
              </div>
              <span style="font-weight:600;font-size:.9rem">{{ id }}</span>
            </div>
            <button class="btn-cp btn-danger-cp btn-sm-cp" (click)="revokeCoach(id)">
              <i class="bi bi-x-lg"></i> R&eacute;voquer
            </button>
          </div>
        </div>
        <div *ngIf="!record.authorizedCoachIds || record.authorizedCoachIds.length === 0"
             style="text-align:center;padding:20px;color:var(--muted);font-size:.85rem">
          <i class="bi bi-people" style="font-size:1.5rem;display:block;margin-bottom:8px;opacity:.4"></i>
          Aucun coach autoris&eacute; pour l'instant.
        </div>
      </section>
    </div>
  `,
})
export class MedicalComponent implements OnInit {
  record: MedicalRecord = { allergies: [], medications: [], chronicConditions: [], consent: false };
  saved = false;
  saving = false;
  errorMsg = '';
  coachEmail = '';

  constructor(private cs: CoachingService) {}

  ngOnInit() {
    this.cs.myMedical().subscribe({ next: r => this.record = r, error: () => {} });
  }

  save() {
    this.saving = true;
    this.saved = false;
    this.errorMsg = '';
    this.cs.upsertMedical(this.record).subscribe({
      next: r => {
        this.record = r;
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 6000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Erreur lors de l\'enregistrement. V\u00e9rifiez que le backend est lanc\u00e9.';
      },
    });
  }

  authorizeCoach() {
    const id = this.coachEmail.trim();
    if (!id) return;
    this.cs.authorizeCoach(id).subscribe({
      next: r => { this.record = r; this.coachEmail = ''; },
      error: () => { this.errorMsg = 'Impossible d\'autoriser ce coach. V\u00e9rifiez l\'identifiant.'; },
    });
  }

  revokeCoach(id: string) {
    if (!confirm('R\u00e9voquer l\'acc\u00e8s de ce coach ?')) return;
    this.cs.revokeCoach(id).subscribe({
      next: r => { this.record = r; },
      error: () => { this.errorMsg = 'Erreur lors de la r\u00e9vocation.'; },
    });
  }

  joinList(arr?: string[]): string { return (arr || []).join(', '); }
  splitList(value: string): string[] {
    return (value || '').split(',').map(x => x.trim()).filter(x => x.length > 0);
  }
}
