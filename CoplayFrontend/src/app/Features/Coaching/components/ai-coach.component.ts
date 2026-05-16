import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { CoachingService } from '../services/coaching.service';

interface Msg { role: 'user' | 'bot'; text: string; time: string; }

@Component({
  selector: 'app-ai-coach',
  styles: [`
    :host { display: block; }
    .bento-coach {
      display: grid; grid-template-columns: repeat(12, 1fr);
      gap: var(--gap); grid-auto-rows: minmax(360px, auto);
    }
    .bento-coach > * { grid-column: span 4; }
    @media (max-width: 1100px) { .bento-coach > * { grid-column: span 12; } }
    .panel {
      border-radius: var(--radius-lg); padding: 24px;
      position: relative; overflow: hidden; display: flex; flex-direction: column;
    }
  `],
  template: `
    <div class="crumb-row">
      <button class="crumb-back" routerLink="/coaching"><i class="bi bi-arrow-left"></i> Retour</button>
      <div class="crumb">
        <a routerLink="/coaching">Coaching</a>
        <span>&#8250;</span>
        <span>Coach IA</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Intelligence artificielle</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Coach IA</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            G&eacute;n&eacute;ration de programmes, analyse de risque, conseils personnalis&eacute;s. 24/7.</p>
        </div>
        <div class="badge-cp"><i class="bi bi-stars"></i> Powered by Groq &middot; Llama 3.1</div>
      </div>
    </div>

    <div class="full" style="padding-top:24px">
      <div class="bento-coach">
        <!-- Programme builder -->
        <div class="panel" style="background:linear-gradient(160deg,white,#E9F9EF);border:1px solid var(--line-strong)" [cpReveal]="0">
          <div class="tile-icon" style="background:var(--accent);color:var(--navy)"><i class="bi bi-card-checklist"></i></div>
          <h3 class="display" style="font-size:30px;margin:18px 0 4px">Programme IA</h3>
          <p style="color:var(--muted);font-size:13.5px;margin:0 0 18px">Plan personnalis&eacute; selon votre niveau et vos blessures.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="cp-field"><span class="cp-field-label">Sport</span>
              <input class="cp-field-input" [(ngModel)]="prog.sport" placeholder="Football, tennis..."></div>
            <div class="cp-field"><span class="cp-field-label">Objectif</span>
              <select class="cp-field-input" [(ngModel)]="prog.objective">
                <option>FITNESS</option><option>STRENGTH</option><option>ENDURANCE</option><option>REHAB</option><option>SPORT_SPECIFIC</option>
              </select></div>
            <div class="cp-field"><span class="cp-field-label">Niveau</span>
              <select class="cp-field-input" [(ngModel)]="prog.level">
                <option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option>
              </select></div>
            <div class="cp-field"><span class="cp-field-label">Semaines</span>
              <input class="cp-field-input" type="number" [(ngModel)]="prog.durationWeeks" min="1" max="16"></div>
          </div>
          <button class="btn-cp btn-primary-cp" (click)="generate()" [disabled]="loadingProg" style="width:100%;justify-content:center;margin-top:16px">
            <span *ngIf="loadingProg"><span class="live-dot"></span> G&eacute;n&eacute;ration&hellip;</span>
            <span *ngIf="!loadingProg"><i class="bi bi-stars"></i> G&eacute;n&eacute;rer mon programme</span>
          </button>
          <div *ngIf="generated" style="margin-top:14px;padding:10px 14px;background:rgba(0,230,118,.12);border-radius:10px;font-size:13px;color:var(--accent-deep);display:flex;align-items:center;gap:8px">
            <i class="bi bi-check-lg"></i> Programme g&eacute;n&eacute;r&eacute; — voir dans Programmes.
          </div>
        </div>

        <!-- ACWR risk -->
        <div class="panel" style="background:var(--ink);color:white;border:1px solid rgba(255,255,255,.1)" [cpReveal]="70">
          <div style="position:absolute;inset:0;background:radial-gradient(60% 70% at 100% 0%,rgba(0,230,118,0.18),transparent 60%)"></div>
          <div style="position:relative">
            <div class="tile-icon" style="background:rgba(255,255,255,.08);color:var(--accent)"><i class="bi bi-activity"></i></div>
            <h3 class="display" style="font-size:30px;margin:18px 0 4px">Risque blessure</h3>
            <p style="color:var(--muted-2);font-size:13.5px;margin:0 0 18px">Analyse ACWR + IA contextuelle.</p>
            <div style="display:flex;align-items:center;justify-content:center;padding:8px 0 12px">
              <cp-acwr-gauge [value]="risk ? (risk.acwr || 0) : 0"></cp-acwr-gauge>
            </div>
            <button class="btn-cp btn-primary-cp" (click)="checkRisk()" [disabled]="loadingRisk" style="width:100%;justify-content:center">
              <span *ngIf="loadingRisk"><span class="live-dot"></span> Analyse&hellip;</span>
              <span *ngIf="!loadingRisk"><i class="bi bi-search"></i> Analyser maintenant</span>
            </button>
            <div *ngIf="risk && risk.label !== 'NONE'" style="margin-top:14px;padding:10px 14px;background:rgba(0,230,118,.10);border:1px solid rgba(0,230,118,.3);border-radius:10px;font-size:13px;color:var(--accent)">
              {{ riskLabel(risk.label) }} (ACWR: {{ risk.acwr }}) — {{ risk.advice || 'Continuez la charge actuelle.' }}
            </div>
            <div *ngIf="risk && risk.label === 'NONE'" style="margin-top:14px;padding:10px 14px;background:var(--cream-2);border-radius:10px;font-size:13px;color:var(--muted)">
              <i class="bi bi-info-circle"></i> Aucune donn&eacute;e de performance. Enregistrez des s&eacute;ances dans <a routerLink="/coaching/progress" style="color:var(--ink);font-weight:600">Progr&egrave;s</a> pour activer l'analyse.
            </div>
            <div *ngIf="riskError" style="margin-top:14px;padding:10px 14px;background:rgba(240,90,90,.10);border:1px solid rgba(240,90,90,.3);border-radius:10px;font-size:13px;color:var(--danger)">
              <i class="bi bi-exclamation-triangle"></i> {{ riskError }}
            </div>
          </div>
        </div>

        <!-- Today metrics -->
        <div class="panel" style="background:white;border:1px solid var(--line-strong)" [cpReveal]="140">
          <div class="tile-icon"><i class="bi bi-lightning-charge-fill"></i></div>
          <h3 class="display" style="font-size:30px;margin:18px 0 4px">Aujourd'hui</h3>
          <p style="color:var(--muted);font-size:13.5px;margin:0 0 18px">Vos m&eacute;triques rapides.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
            <div style="padding:14px 16px;background:var(--cream);border-radius:12px">
              <div class="display" style="font-size:32px">{{ messages.length }}</div>
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">&Eacute;CHANGES IA</div>
            </div>
            <div style="padding:14px 16px;background:var(--cream);border-radius:12px">
              <div class="display" style="font-size:32px;color:var(--accent)">{{ generated ? '1' : '0' }}</div>
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">PROGRAMMES</div>
            </div>
            <div style="padding:14px 16px;background:var(--cream);border-radius:12px">
              <div class="display" style="font-size:32px">68<span style="font-size:16px;opacity:.5">%</span></div>
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">OBJECTIF JOUR</div>
            </div>
            <div style="padding:14px 16px;background:var(--cream);border-radius:12px">
              <div class="display" style="font-size:32px">2.4<span style="font-size:16px;opacity:.5">L</span></div>
              <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted)">HYDRATATION</div>
            </div>
          </div>
          <div style="padding:12px 14px;background:rgba(255,179,71,.12);border-radius:10px;font-size:13px;line-height:1.45;display:flex;gap:10px;align-items:flex-start">
            <i class="bi bi-lightning-charge-fill" style="color:var(--warning);flex-shrink:0"></i>
            <div><b>Astuce :</b> L'IA adapte automatiquement votre programme &agrave; vos blessures actives.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat -->
    <section class="row-section" style="padding-top:calc(var(--row-y) * .85)">
      <div [cpReveal]="0" style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <i class="bi bi-robot" style="font-size:1.2rem"></i>
        <span class="eyebrow">Conversation avec votre coach</span>
      </div>
      <div [cpReveal]="60">
        <div class="card-cp" style="padding:0;overflow:hidden;min-height:480px;display:flex;flex-direction:column">
          <div #stream style="flex:1;padding:24px;display:flex;flex-direction:column;gap:14px;min-height:380px;overflow-y:auto">
            <div *ngIf="messages.length === 0" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:18px">
              <div style="width:80px;height:80px;border-radius:50%;background:radial-gradient(circle at 30% 30%,var(--accent),var(--accent-deep));box-shadow:0 0 60px rgba(0,230,118,.45);animation:orb-float 5s ease-in-out infinite"></div>
              <h3 class="display" style="font-size:46px;margin:0">Posez une question</h3>
              <p style="color:var(--muted);max-width:480px">Nutrition, r&eacute;cup&eacute;ration, technique, planification — votre coach IA r&eacute;pond en moins de 2 secondes.</p>
            </div>
            <div *ngFor="let m of messages" class="bubble" [ngClass]="m.role === 'user' ? 'user' : 'ai'">{{ m.text }}</div>
            <div *ngIf="loading" class="bubble ai" style="display:inline-flex;gap:5px">
              <span class="live-dot" style="background:var(--muted)"></span>
              <span class="live-dot" style="background:var(--muted);animation-delay:.2s"></span>
              <span class="live-dot" style="background:var(--muted);animation-delay:.4s"></span>
            </div>
          </div>
          <div style="padding:14px 16px;border-top:1px solid var(--line);display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <button *ngFor="let c of quickChips" class="chip light" (click)="quickAsk(c)">{{ c }}</button>
            <input style="flex:1;min-width:200px;border:0;background:var(--cream-2);padding:12px 16px;border-radius:12px;font-size:14px;outline:none"
                   [(ngModel)]="input" placeholder="Demandez &agrave; votre coach&hellip;" (keydown.enter)="send()">
            <button class="btn-cp btn-primary-cp" (click)="send()" [disabled]="loading || !input.trim()"><i class="bi bi-send"></i></button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AiCoachComponent implements AfterViewChecked {
  @ViewChild('stream') stream?: ElementRef<HTMLDivElement>;
  messages: Msg[] = [];
  input = '';
  loading = false;
  loadingProg = false;
  loadingRisk = false;
  prog: any = { objective: 'FITNESS', level: 'BEGINNER', durationWeeks: 4 };
  generated: any = null;
  risk: any = null;
  riskError = '';
  quickChips = ['Nutrition pr\u00e9-match', 'R\u00e9cup\u00e9rer plus vite', 'Plan semaine', '\u00c9tirements'];
  private shouldScroll = false;

  constructor(private cs: CoachingService, private router: Router) {}

  quickAsk(q: string) { this.input = q; this.send(); }

  send() {
    const t = this.input.trim(); if (!t) return;
    this.messages.push({ role: 'user', text: t, time: this.now() });
    this.input = ''; this.loading = true; this.shouldScroll = true;
    this.cs.chat(t).subscribe({
      next: r => { this.messages.push({ role: 'bot', text: r.reply || '...', time: this.now() }); this.loading = false; this.shouldScroll = true; },
      error: () => { this.messages.push({ role: 'bot', text: 'Erreur IA, r\u00e9essayez.', time: this.now() }); this.loading = false; this.shouldScroll = true; },
    });
  }

  generate() {
    this.loadingProg = true;
    this.cs.generateProgram(this.prog).subscribe({
      next: p => { this.generated = p; this.loadingProg = false; },
      error: () => this.loadingProg = false,
    });
  }

  checkRisk() {
    this.loadingRisk = true;
    this.riskError = '';
    this.cs.injuryRisk().subscribe({
      next: r => { this.risk = r; this.loadingRisk = false; },
      error: err => {
        this.loadingRisk = false;
        if (err.status === 401 || err.status === 403) {
          this.riskError = 'Connectez-vous d\'abord pour analyser votre risque.';
        } else {
          this.riskError = 'Erreur serveur. Vérifiez que le backend est lancé et réessayez.';
        }
      },
    });
  }

  riskLabel(l: string) {
    return l === 'LOW' ? 'Sous-charge' : l === 'OK' ? 'Optimal'
         : l === 'ELEVATED' ? '\u00c9lev\u00e9' : l === 'HIGH' ? 'Risque' : '\u2014';
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.stream) {
      this.stream.nativeElement.scrollTop = this.stream.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }
  now() { return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
}
