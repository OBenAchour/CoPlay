import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';
import { LibraryExercise } from '../../../Core/Models/Coaching/Coaching';

@Component({
  selector: 'app-exercises',
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a><span>&#8250;</span><span>Biblioth&egrave;que</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Biblioth&egrave;que</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Exercices &amp; d&eacute;mos vid&eacute;o</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            R&eacute;f&eacute;rentiel d'exercices avec instructions, muscles cibl&eacute;s et vid&eacute;os.</p>
        </div>
        <button class="btn-cp btn-primary-cp" (click)="showForm = !showForm">
          <i class="bi" [class.bi-plus-lg]="!showForm" [class.bi-x-lg]="showForm"></i>
          {{ showForm ? 'Annuler' : 'Nouvel exercice' }}
        </button>
      </div>
    </div>

    <div class="full" style="padding-top:24px">
      <section class="card-cp p-4 mb-4" *ngIf="showForm" [cpReveal]="0">
        <h3 class="display" style="font-size:20px;margin-bottom:16px">Cr&eacute;er un exercice</h3>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="cp-field">
              <label class="cp-field-label">Nom</label>
              <input class="cp-field-input" [(ngModel)]="form.name">
            </div>
          </div>
          <div class="col-md-3">
            <div class="cp-field">
              <label class="cp-field-label">Difficult&eacute;</label>
              <select class="cp-field-input" [(ngModel)]="form.difficulty">
                <option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="cp-field">
              <label class="cp-field-label">&Eacute;quipement</label>
              <input class="cp-field-input" [(ngModel)]="form.equipmentNeeded" placeholder="Aucun, halt&egrave;res...">
            </div>
          </div>
          <div class="col-12">
            <div class="cp-field">
              <label class="cp-field-label">Description</label>
              <textarea class="cp-field-input" [(ngModel)]="form.description"></textarea>
            </div>
          </div>
          <div class="col-12">
            <div class="cp-field">
              <label class="cp-field-label">Instructions</label>
              <textarea class="cp-field-input" [(ngModel)]="form.instructions"></textarea>
            </div>
          </div>
        </div>
        <div style="margin-top:16px">
          <button class="btn-cp btn-primary-cp" (click)="create()">Cr&eacute;er</button>
        </div>
      </section>

      <div class="cp-empty" *ngIf="exercises.length === 0" [cpReveal]="50">
        <i class="bi bi-collection-play"></i>
        <h4>Biblioth&egrave;que vide</h4>
        <p>Ajoutez votre premier exercice avec d&eacute;monstration vid&eacute;o.</p>
      </div>

      <div class="row g-4" *ngIf="exercises.length > 0">
        <div *ngFor="let e of exercises; let i = index" class="col-md-4" [cpReveal]="i * 60">
          <article class="card-cp" style="overflow:hidden">
            <div style="aspect-ratio:16/9;background:var(--ink);position:relative">
              <video *ngIf="e.videoUrl" [src]="e.videoUrl" controls style="width:100%;height:100%;object-fit:cover"></video>
              <div *ngIf="!e.videoUrl" style="width:100%;height:100%;display:grid;place-items:center;color:rgba(255,255,255,.3)">
                <i class="bi bi-camera-video-off" style="font-size:2.5rem"></i>
              </div>
            </div>
            <div style="padding:16px">
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
                <span class="badge-cp" [style.background]="diffBg(e.difficulty)" [style.color]="diffColor(e.difficulty)">{{ e.difficulty }}</span>
                <span class="badge-cp" *ngIf="e.equipmentNeeded">{{ e.equipmentNeeded }}</span>
              </div>
              <h5 class="display" style="font-size:18px;line-height:1.2">{{ e.name }}</h5>
              <p style="color:var(--muted);margin:8px 0 16px;font-size:.85rem">{{ e.description }}</p>
              <label class="btn-cp btn-ghost-cp" style="cursor:pointer;justify-content:center;width:100%">
                <input type="file" (change)="upload($event, e)" accept="video/*" hidden>
                <i class="bi bi-upload"></i> {{ e.videoUrl ? 'Remplacer vid&eacute;o' : 'Uploader vid&eacute;o' }}
              </label>
            </div>
          </article>
        </div>
      </div>
    </div>
  `,
})
export class ExercisesComponent implements OnInit {
  exercises: LibraryExercise[] = [];
  showForm = false;
  form: Partial<LibraryExercise> = { difficulty: 'BEGINNER' };
  constructor(private cs: CoachingService) {}
  ngOnInit() { this.load(); }
  load() { this.cs.listExercises().subscribe(p => this.exercises = p?.content || []); }
  create() { this.cs.createExercise(this.form).subscribe(() => { this.showForm = false; this.form = { difficulty: 'BEGINNER' }; this.load(); }); }
  upload(ev: any, e: LibraryExercise) {
    const f = ev.target.files[0]; if (!f) return;
    this.cs.uploadExerciseVideo(e.exerciseId!, f).subscribe(() => this.load());
  }
  diffBg(d?: string) {
    return d === 'BEGINNER' ? 'rgba(0,230,118,.14)' : d === 'INTERMEDIATE' ? 'rgba(255,193,7,.14)' : 'rgba(244,67,54,.14)';
  }
  diffColor(d?: string) {
    return d === 'BEGINNER' ? 'var(--accent-deep)' : d === 'INTERMEDIATE' ? '#f9a825' : '#e53935';
  }
}
