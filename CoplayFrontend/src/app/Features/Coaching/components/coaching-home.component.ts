import { Component, OnInit } from '@angular/core';
import { CoachingService } from '../services/coaching.service';

interface Tile {
  icon: string;
  label: string;
  desc: string;
  link: string;
  accent?: boolean;
  badge?: string;
  count?: string;
  span: string;
  sparkData?: number[];
}

@Component({
  selector: 'app-coaching-home',
  template: `
    <!-- Breadcrumb row -->
    <div class="crumb-row">
      <div class="crumb">
        <a routerLink="/dashboard">CoPlay</a>
        <span>&#8250;</span>
        <span>Coaching</span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Performance &middot; Sant&eacute;</div>
          <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Coaching &amp; Suivi</h1>
          <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
            Programmes IA, suivi blessures, nutrition, performance. Tout en un.
          </p>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn-cp btn-ghost-cp" routerLink="/coaching/programs">
            <i class="bi bi-calendar3"></i> Mon planning
          </button>
          <button class="btn-cp btn-primary-cp" routerLink="/coaching/ai">
            <i class="bi bi-stars"></i> Coach IA
          </button>
        </div>
      </div>
    </div>

    <!-- Hero section -->
    <div class="full" style="padding-top:24px">
      <section class="hero hero-grain" [cpReveal]="0">
        <div class="orb"></div>
        <div class="hero-grid"></div>

        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:center">
          <!-- Left: CTA -->
          <div>
            <div class="badge-cp on-dark"><i class="bi bi-lightning-charge-fill"></i> Tableau de bord</div>
            <h1 class="display" style="font-size:clamp(56px,10vw,168px);margin:14px 0 22px">
              Push your<br><span style="color:var(--accent)">limits.</span>
            </h1>
            <p class="lede">
              Programmes personnalis&eacute;s g&eacute;n&eacute;r&eacute;s par IA, pr&eacute;diction de risque blessure (ACWR),
              plans nutrition adaptatifs. Performez en s&eacute;curit&eacute;.
            </p>
            <div style="display:flex;gap:12px;margin-top:30px;flex-wrap:wrap">
              <button class="btn-cp btn-primary-cp" routerLink="/coaching/ai">
                <i class="bi bi-stars"></i> G&eacute;n&eacute;rer programme
              </button>
              <button class="btn-cp btn-on-dark-cp" (click)="analyzeForm()">
                <i class="bi bi-activity"></i> Analyser ma forme
              </button>
            </div>
          </div>

          <!-- Right: live dashboard -->
          <div style="display:grid;gap:16px">
            <!-- ACWR Card -->
            <div style="padding:22px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <div class="mono" style="font-size:10.5px;letter-spacing:.16em;color:var(--accent)">INDICATEUR ACWR</div>
                  <div style="font-size:13px;color:var(--muted-2);margin-top:4px">Charge aigu&euml; / chronique &middot; 7j vs 28j</div>
                </div>
                <span class="badge-cp on-dark">{{ risk ? 'ZONE OPTIMALE' : 'EN ATTENTE' }}</span>
              </div>
              <div style="display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;margin-top:14px">
                <cp-acwr-gauge [value]="acwrValue"></cp-acwr-gauge>
                <div style="display:grid;gap:10px">
                  <div *ngFor="let b of bars">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted-2);font-family:var(--font-mono);letter-spacing:.1em">
                      <span>{{ b.label }}</span>
                      <span style="color:white">{{ b.value }}</span>
                    </div>
                    <div class="bar" style="background:rgba(255,255,255,.07);margin-top:6px">
                      <i [style.width.%]="b.pct"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Volume 14j Card -->
            <div style="padding:22px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <div>
                  <div class="mono" style="font-size:10.5px;letter-spacing:.16em;color:var(--accent)">VOLUME 14 JOURS</div>
                  <div style="font-size:13px;color:var(--muted-2);margin-top:2px">
                    Tendance : <span style="color:var(--accent)">+12%</span>
                  </div>
                </div>
                <div class="display" style="font-size:32px;color:white">14h<span style="font-size:18px;opacity:.5">30</span></div>
              </div>
              <div class="sparkbars">
                <i *ngFor="let h of volumeBars" [style.height.%]="h"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modules section -->
    <section class="row-section" style="padding-top:calc(var(--row-y) * .85)">
      <div [cpReveal]="0">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;gap:24px;flex-wrap:wrap">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <span style="width:36px;height:1px;background:var(--ink)"></span>
              <span class="eyebrow">Modules</span>
            </div>
            <h2 class="display" style="font-size:48px;margin:0">Tout votre coaching</h2>
          </div>
          <div class="badge-cp"><span class="live-dot"></span> 9 modules &middot; sync temps r&eacute;el</div>
        </div>
      </div>

      <div class="bento" style="grid-auto-rows:minmax(220px,auto)">
        <a *ngFor="let t of tiles; let i = index"
           class="tile {{ t.accent ? 'accent' : '' }}"
           [routerLink]="t.link"
           [ngStyle]="{'grid-column': t.span === 'b-2' ? 'span 6' : 'span 4', 'min-height': t.span === 'b-2' ? '240px' : '220px'}"
           [cpReveal]="i * 45">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div class="tile-icon"><i class="bi" [class]="'bi-' + t.icon"></i></div>
            <span *ngIf="t.badge" class="badge-cp"
                  [ngStyle]="{
                    background: t.accent ? 'rgba(14,26,43,.12)' : '',
                    color: t.accent ? 'var(--navy)' : ''
                  }">{{ t.badge }}</span>
          </div>
          <h3>{{ t.label }}</h3>
          <p>{{ t.desc }}</p>
          <div *ngIf="t.count" class="mono"
               [ngStyle]="{
                 'font-size': '11px',
                 'letter-spacing': '.14em',
                 'margin-top': '4px',
                 'color': t.accent ? 'rgba(14,26,43,.6)' : 'var(--muted)'
               }">{{ t.count }}</div>
          <!-- Sparkbars for Progrès tile -->
          <div *ngIf="t.sparkData" class="sparkbars" style="margin-top:auto">
            <i *ngFor="let h of t.sparkData" [style.height.%]="h" style="background:var(--ink)"></i>
          </div>
          <div class="arrow"><i class="bi bi-arrow-up-right"></i></div>
        </a>
      </div>
    </section>
  `,
  styles: [`
    .lede {
      max-width: 560px;
      font-size: 17px;
      line-height: 1.55;
      color: #C7CFDC;
    }
  `],
})
export class CoachingHomeComponent implements OnInit {
  risk: any;
  acwrValue = 0.92;
  volumeBars = [20, 30, 42, 55, 38, 72, 90, 78, 60, 45, 82, 95, 88, 70];

  bars = [
    { label: 'CHARGE 7J', value: '4 280 UA', pct: 88 },
    { label: 'CHARGE 28J', value: '4 650 UA', pct: 72 },
    { label: 'RISQUE BLESSURE', value: 'Faible', pct: 18 },
  ];

  tiles: Tile[] = [
    { icon: 'card-checklist', label: 'Programmes', desc: "Vos plans d'entraînement actifs", link: '/coaching/programs', count: '3 actifs', span: 'b-1' },
    { icon: 'stars', label: 'Coach IA', desc: 'Génération auto + chatbot 24/7', link: '/coaching/ai', accent: true, badge: 'NEW', span: 'b-2' },
    { icon: 'lightning-charge-fill', label: 'Bibliothèque', desc: 'Exercices avec démos vidéo', link: '/coaching/exercises', count: '420+ exercices', span: 'b-1' },
    { icon: 'bandaid', label: 'Blessures', desc: 'Suivi & historique médical', link: '/coaching/injuries', count: '0 actives', span: 'b-1' },
    { icon: 'apple', label: 'Nutrition', desc: 'Plans IA personnalisés', link: '/coaching/nutrition', span: 'b-1' },
    { icon: 'droplet-fill', label: 'Hydratation', desc: 'Objectif quotidien', link: '/coaching/hydration', count: '2.4L / 3L', span: 'b-1' },
    { icon: 'graph-up-arrow', label: 'Progrès', desc: 'Performance & charge', link: '/coaching/progress', count: '+12%', span: 'b-2', sparkData: [40, 55, 48, 62, 58, 75, 82, 90] },
    { icon: 'shield-lock', label: 'Dossier médical', desc: 'Privé · partage contrôlé', link: '/coaching/medical', span: 'b-1' },
    { icon: 'people-fill', label: 'Coaches', desc: 'Trouver un coach certifié', link: '/coaching/coaches', count: '48 dispo', span: 'b-1' },
  ];

  constructor(private cs: CoachingService) {}

  ngOnInit() {
    this.cs.recovery().subscribe({
      next: r => {
        if (r && r.label && r.label !== 'NONE') {
          this.risk = r;
          if (r.acwr) this.acwrValue = parseFloat(r.acwr) || 0.92;
          if (r.acute7d) this.bars[0].value = r.acute7d + ' UA';
          if (r.chronic28d) this.bars[1].value = r.chronic28d + ' UA';
          this.bars[2].value = this.riskLabel(r.label);
          this.bars[2].pct = r.label === 'LOW' ? 18 : r.label === 'OK' ? 25 : r.label === 'ELEVATED' ? 65 : 90;
        }
      },
      error: () => {},
    });
  }

  analyzeForm() {
    this.cs.injuryRisk().subscribe({
      next: () => alert('Analyse lancée ! Vérifiez vos données de performance.'),
      error: () => alert('Connectez-vous d\'abord pour analyser votre forme.'),
    });
  }

  riskLabel(l: string): string {
    return l === 'LOW' ? 'Sous-charge' : l === 'OK' ? 'Optimal'
         : l === 'ELEVATED' ? 'Élevé' : l === 'HIGH' ? 'Risque' : '—';
  }
}
