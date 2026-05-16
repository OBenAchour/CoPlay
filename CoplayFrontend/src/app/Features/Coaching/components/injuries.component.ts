import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { Injury } from '../../../Core/Models/Coaching/Coaching';

@Component({
  selector: 'app-injuries',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a><span>&#8250;</span><span>Blessures</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Healthcare</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Suivi des blessures</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Enregistrez et suivez l'&eacute;volution. L'IA prend en compte vos blessures actives.</p>
        </div>
      </div>
    </div>

    <div class="full" style="padding-top:24px">
      <div class="row g-3 mb-4" [cpReveal]="0">
        <div class="col-md-3">
          <div class="card-cp p-3">
            <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">TOTAL</div>
            <div class="display" style="font-size:2rem">{{ injuries.length }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-cp p-3">
            <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">ACTIVES</div>
            <div class="display" style="font-size:2rem;color:var(--red)">{{ count('ACTIVE') }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-cp p-3">
            <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">EN GU&Eacute;RISON</div>
            <div class="display" style="font-size:2rem;color:var(--amber)">{{ count('HEALING') }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-cp p-3">
            <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">R&Eacute;CUP&Eacute;R&Eacute;ES</div>
            <div class="display" style="font-size:2rem;color:var(--accent-deep)">{{ count('RECOVERED') }}</div>
          </div>
        </div>
      </div>

      <section class="card-cp p-4 mb-4" [cpReveal]="60">
        <h3 class="display" style="font-size:1.2rem;margin-bottom:16px">Nouvelle blessure</h3>
        <div class="row g-3">
          <div class="col-md-3">
            <div class="cp-field">
              <label class="cp-field-label">Zone</label>
              <input class="cp-field-input" [(ngModel)]="form.bodyPart" placeholder="Genou, &eacute;paule...">
            </div>
          </div>
          <div class="col-md-3">
            <div class="cp-field">
              <label class="cp-field-label">Type</label>
              <input class="cp-field-input" [(ngModel)]="form.type" placeholder="Entorse, foulure...">
            </div>
          </div>
          <div class="col-md-2">
            <div class="cp-field">
              <label class="cp-field-label">S&eacute;v&eacute;rit&eacute;</label>
              <select class="cp-field-input" [(ngModel)]="form.severity">
                <option value="MINOR">Mineure</option>
                <option value="MODERATE">Mod&eacute;r&eacute;e</option>
                <option value="SEVERE">S&eacute;v&egrave;re</option>
              </select>
            </div>
          </div>
          <div class="col-md-2">
            <div class="cp-field">
              <label class="cp-field-label">Date</label>
              <input class="cp-field-input" type="date" [(ngModel)]="form.dateOccurred">
            </div>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn-cp btn-primary-cp w-100" (click)="add()"><i class="bi bi-plus-lg"></i> Ajouter</button>
          </div>
        </div>
      </section>

      <div class="cp-empty" *ngIf="injuries.length === 0" [cpReveal]="80">
        <i class="bi bi-bandaid"></i>
        <h4>Aucune blessure enregistr&eacute;e</h4>
        <p>Bonne nouvelle ! Continuez &agrave; vous entra&icirc;ner en s&eacute;curit&eacute;.</p>
      </div>

      <div class="card-cp overflow-hidden" *ngIf="injuries.length > 0" [cpReveal]="80">
        <table class="cp-table">
          <thead><tr><th>Zone</th><th>Type</th><th>S&eacute;v&eacute;rit&eacute;</th><th>Date</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let i of injuries">
              <td><strong>{{ i.bodyPart }}</strong></td>
              <td>{{ i.type }}</td>
              <td><span class="badge-cp" [ngClass]="severityClass(i.severity)">{{ severityLabel(i.severity) }}</span></td>
              <td class="mono">{{ i.dateOccurred }}</td>
              <td>
                <select class="cp-field-input" style="padding:.4rem .6rem;font-size:.8rem" [ngModel]="i.status" (ngModelChange)="updateStatus(i, $event)">
                  <option value="ACTIVE">Active</option>
                  <option value="HEALING">En gu&eacute;rison</option>
                  <option value="RECOVERED">R&eacute;cup&eacute;r&eacute;e</option>
                </select>
              </td>
              <td><button class="btn-cp btn-danger-cp btn-sm-cp" (click)="del(i)"><i class="bi bi-trash"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class InjuriesComponent implements OnInit {
  injuries: Injury[] = [];
  form: Partial<Injury> = { severity: 'MINOR' };
  constructor(private cs: CoachingService) {}
  ngOnInit() { this.load(); }
  load() { this.cs.myInjuries().subscribe(r => this.injuries = r); }
  add() { this.cs.createInjury(this.form).subscribe(() => { this.form = { severity: 'MINOR' }; this.load(); }); }
  updateStatus(i: Injury, status: string) { this.cs.updateInjury(i.injuryId!, { ...i, status: status as any }).subscribe(() => this.load()); }
  del(i: Injury) { if (confirm('Supprimer ?')) this.cs.deleteInjury(i.injuryId!).subscribe(() => this.load()); }
  count(s: string) { return this.injuries.filter(i => i.status === s).length; }
  severityLabel(s?: string) { return s === 'MINOR' ? 'Mineure' : s === 'MODERATE' ? 'Modérée' : 'Sévère'; }
  severityClass(s?: string) { return s === 'MINOR' ? '' : s === 'MODERATE' ? 'amber' : 'danger-bdg'; }
}
