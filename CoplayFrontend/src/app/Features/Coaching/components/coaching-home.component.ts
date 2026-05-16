import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CoachingService } from '../services/coaching.service';
import { MarketplaceService } from '../../Marketplace/services/marketplace.service';

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

    <!-- 🆕 BANNIÈRE MODULES CONNECTÉS -->
    <div class="connected-modules">
      <div class="cm-title">
        <i class="bi bi-diagram-3-fill"></i>
        <span>Modules connectés</span>
        <small *ngIf="loadingCounters">chargement…</small>
      </div>
      <div class="cm-grid">
        <a class="cm-card cm-injury" [class.alert]="activeInjuriesCount > 0" routerLink="/coaching/injuries">
          <div class="cm-num">{{ activeInjuriesCount }}</div>
          <div class="cm-label"><i class="bi bi-bandaid"></i> Blessures actives</div>
          <div class="cm-hint" *ngIf="activeInjuriesCount > 0">⚠️ Sessions bloquées</div>
          <div class="cm-hint" *ngIf="activeInjuriesCount === 0">✅ Tu peux t'entraîner</div>
        </a>

        <a class="cm-card" routerLink="/coaching/programs">
          <div class="cm-num">{{ activeProgramsCount }}</div>
          <div class="cm-label"><i class="bi bi-calendar3"></i> Programmes actifs</div>
          <div class="cm-hint">{{ activeProgramsCount > 0 ? 'Voir le planning' : 'Aucun en cours' }}</div>
        </a>

        <a class="cm-card" routerLink="/marketplace/orders">
          <div class="cm-num">{{ pendingOrdersCount }}</div>
          <div class="cm-label"><i class="bi bi-bag-check"></i> Commandes en cours</div>
          <div class="cm-hint">{{ pendingOrdersCount > 0 ? 'Voir mes achats' : 'Aucune commande' }}</div>
        </a>

        <a class="cm-card" routerLink="/coaching/coaches">
          <div class="cm-num">{{ coachesAvailableCount }}</div>
          <div class="cm-label"><i class="bi bi-person-badge"></i> Coachs disponibles</div>
          <div class="cm-hint">Trouve le tien</div>
        </a>
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

    <!-- 🆕 MODAL ANALYSE MA FORME -->
    <div class="analysis-modal" *ngIf="showAnalysis" (click)="showAnalysis = false">
      <div class="analysis-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="showAnalysis = false" aria-label="Fermer">×</button>

        <header class="analysis-header">
          <i class="bi bi-activity"></i>
          <div>
            <div class="eyebrow">Analyse multi-modules</div>
            <h2>Bilan de ta forme</h2>
          </div>
        </header>

        <div class="analysis-status" [ngClass]="analysisStatusClass">
          <i class="bi" [class]="analysisIcon"></i>
          <div>
            <strong>{{ analysisHeadline }}</strong>
            <p>{{ analysisAdvice }}</p>
          </div>
        </div>

        <div class="analysis-grid">
          <div class="analysis-card">
            <div class="mono small">BLESSURES (Coaching)</div>
            <div class="big-num">{{ activeInjuriesCount }}</div>
            <p>{{ activeInjuriesCount > 0 ? 'Tu as une blessure ACTIVE qui bloque la planification de sessions.' : 'Aucune blessure active — tu es libre de tout enchaîner.' }}</p>
            <a class="link" routerLink="/coaching/injuries" (click)="showAnalysis = false">→ Gérer mes blessures</a>
          </div>

          <div class="analysis-card">
            <div class="mono small">PROGRAMMES (Coaching)</div>
            <div class="big-num">{{ activeProgramsCount }}</div>
            <p>{{ activeProgramsCount > 0 ? activeProgramsCount + ' programme(s) en cours.' : 'Aucun programme actif — génère-en un avec le Coach IA.' }}</p>
            <a class="link" routerLink="/coaching/programs" (click)="showAnalysis = false">→ Voir le planning</a>
          </div>

          <div class="analysis-card">
            <div class="mono small">PERFORMANCE (Coaching)</div>
            <div class="big-num">{{ acwrValue }}</div>
            <p>Ratio ACWR · {{ bars[2].value }}</p>
            <a class="link" routerLink="/coaching/progress" (click)="showAnalysis = false">→ Voir la progression</a>
          </div>

          <div class="analysis-card" *ngIf="recommendedServiceLink">
            <div class="mono small">RECOMMANDATION (Marketplace)</div>
            <div class="big-num"><i class="bi bi-bag-heart"></i></div>
            <p>{{ recommendedServiceLabel }}</p>
            <a class="link" [routerLink]="recommendedServiceLink" (click)="showAnalysis = false">→ {{ recommendedServiceCta }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lede {
      max-width: 560px;
      font-size: 17px;
      line-height: 1.55;
      color: #C7CFDC;
    }

    /* Bannière modules connectés */
    .connected-modules {
      max-width: var(--maxw, 1280px);
      margin: 24px auto 0;
      padding: 0 var(--gutter, 24px);
    }
    .cm-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 14px;
      font-family: var(--font-mono);
    }
    .cm-title i { color: var(--accent); }
    .cm-title small { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--muted-2); }
    .cm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
    }
    .cm-card {
      display: block;
      padding: 18px;
      border-radius: 16px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.10);
      text-decoration: none;
      color: inherit;
      transition: transform .15s, border-color .15s, background .15s;
    }
    .cm-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
      background: rgba(255,255,255,.07);
    }
    .cm-card.alert {
      background: linear-gradient(135deg, rgba(239,68,68,.18), rgba(239,68,68,.06));
      border-color: rgba(239,68,68,.55);
    }
    .cm-num {
      font-family: var(--font-display, inherit);
      font-size: 40px;
      line-height: 1;
      font-weight: 700;
      color: var(--accent);
    }
    .cm-card.alert .cm-num { color: #fca5a5; }
    .cm-label {
      margin-top: 8px;
      font-size: 13px;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cm-hint {
      margin-top: 8px;
      font-size: 11px;
      color: var(--muted-2);
      letter-spacing: .04em;
    }

    /* Modal analyse */
    .analysis-modal {
      position: fixed; inset: 0;
      background: rgba(8,14,26,.78);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: fade .2s ease-out;
    }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    .analysis-content {
      width: min(880px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      background: #0E1A2B;
      color: white;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 22px;
      padding: 36px;
      position: relative;
    }
    .modal-close {
      position: absolute; top: 14px; right: 18px;
      background: transparent; border: none;
      color: rgba(255,255,255,.5);
      font-size: 32px; line-height: 1;
      cursor: pointer;
    }
    .modal-close:hover { color: white; }
    .analysis-header {
      display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
    }
    .analysis-header > i {
      width: 52px; height: 52px;
      display: grid; place-items: center;
      border-radius: 14px;
      background: var(--accent); color: var(--navy);
      font-size: 24px;
    }
    .analysis-header h2 { margin: 4px 0 0; font-size: 32px; }
    .analysis-status {
      padding: 18px;
      border-radius: 14px;
      display: flex; gap: 14px; align-items: flex-start;
      margin-bottom: 24px;
    }
    .analysis-status.ok { background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.45); }
    .analysis-status.warn { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.45); }
    .analysis-status.neutral { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); }
    .analysis-status i { font-size: 22px; margin-top: 2px; }
    .analysis-status strong { display: block; font-size: 16px; margin-bottom: 4px; }
    .analysis-status p { margin: 0; color: var(--muted-2); font-size: 14px; }
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 14px;
    }
    .analysis-card {
      padding: 16px;
      border-radius: 14px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.10);
    }
    .analysis-card .mono.small {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: .16em;
      color: var(--accent);
      text-transform: uppercase;
    }
    .analysis-card .big-num {
      font-size: 36px; font-weight: 700; margin: 6px 0 10px;
    }
    .analysis-card p { font-size: 13px; color: var(--muted-2); margin: 0 0 12px; }
    .analysis-card .link {
      font-size: 12px;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }
    .analysis-card .link:hover { text-decoration: underline; }
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

  // 🆕 Compteurs cross-modules
  activeInjuriesCount = 0;
  activeProgramsCount = 0;
  pendingOrdersCount = 0;
  coachesAvailableCount = 0;
  loadingCounters = true;

  // 🆕 État du modal d'analyse
  showAnalysis = false;
  analysisStatusClass = 'neutral';
  analysisIcon = 'bi-info-circle';
  analysisHeadline = '';
  analysisAdvice = '';
  recommendedServiceLink: string | null = null;
  recommendedServiceLabel = '';
  recommendedServiceCta = '';

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

  constructor(
    private cs: CoachingService,
    private mp: MarketplaceService,
    private router: Router,
  ) {}

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

    this.loadCrossModuleCounters();
  }

  /** Charge en parallèle les compteurs des 4 modules connectés. */
  loadCrossModuleCounters() {
    forkJoin({
      injuries: this.cs.myInjuries().pipe(catchError(() => of([]))),
      programs: this.cs.programsAsClient().pipe(catchError(() => of([]))),
      orders: this.mp.myOrders().pipe(catchError(() => of({ content: [] } as any))),
      coaches: this.cs.listCoaches(true, 0, 50).pipe(catchError(() => of({ content: [] } as any))),
    }).subscribe(res => {
      this.activeInjuriesCount = (res.injuries || []).filter(
        (i: any) => i.status === 'ACTIVE' || i.status === 'OPEN' || !i.healed
      ).length;
      this.activeProgramsCount = (res.programs || []).filter(
        (p: any) => !p.status || p.status === 'ACTIVE' || p.status === 'IN_PROGRESS'
      ).length;
      const ordersPage: any = res.orders || {};
      const ordersList = ordersPage.content || ordersPage || [];
      this.pendingOrdersCount = ordersList.filter(
        (o: any) => o.status === 'PENDING' || o.status === 'PAID'
      ).length;
      const coachesPage: any = res.coaches || {};
      const coachesList = coachesPage.content || coachesPage || [];
      this.coachesAvailableCount = coachesList.length;

      // Synchroniser le compteur dans la tuile "Blessures"
      const blessTile = this.tiles.find(t => t.label === 'Blessures');
      if (blessTile) blessTile.count = this.activeInjuriesCount + ' active(s)';

      this.loadingCounters = false;
    });
  }

  /** Vraie analyse cross-modules basée sur les données chargées. */
  analyzeForm() {
    if (this.loadingCounters) {
      // Charge encore en cours → on attend
      setTimeout(() => this.analyzeForm(), 300);
      return;
    }

    if (this.activeInjuriesCount > 0) {
      this.analysisStatusClass = 'warn';
      this.analysisIcon = 'bi-exclamation-triangle-fill';
      this.analysisHeadline = `⛔ ${this.activeInjuriesCount} blessure(s) ACTIVE(s) détectée(s)`;
      this.analysisAdvice = 'La planification de nouvelles séances de coaching est bloquée. Consulte un professionnel via la marketplace ou marque ta blessure comme guérie pour continuer.';
      this.recommendedServiceLink = '/marketplace';
      this.recommendedServiceLabel = 'Trouve un kiné, ostéo ou physio dans la marketplace pour accélérer ta récupération.';
      this.recommendedServiceCta = 'Voir les prestations PHYSIO';
    } else if (this.activeProgramsCount === 0) {
      this.analysisStatusClass = 'neutral';
      this.analysisIcon = 'bi-stars';
      this.analysisHeadline = '🚀 Tu n\'as aucun programme actif';
      this.analysisAdvice = 'Lance le Coach IA pour générer un plan personnalisé basé sur ton sport, ton niveau et ta charge actuelle.';
      this.recommendedServiceLink = '/coaching/ai';
      this.recommendedServiceLabel = 'Le Coach IA peut générer un programme en 30 secondes.';
      this.recommendedServiceCta = 'Générer mon programme';
    } else {
      this.analysisStatusClass = 'ok';
      this.analysisIcon = 'bi-check-circle-fill';
      this.analysisHeadline = '✅ Tu es en forme — continue comme ça';
      this.analysisAdvice = `Aucune blessure active, ${this.activeProgramsCount} programme(s) en cours, ratio ACWR à ${this.acwrValue}. Tu peux planifier d'autres sessions ou enrichir ta routine.`;
      this.recommendedServiceLink = '/marketplace';
      this.recommendedServiceLabel = 'Découvre des équipements ou des prestations pour passer au niveau supérieur.';
      this.recommendedServiceCta = 'Explorer la marketplace';
    }

    this.showAnalysis = true;
  }

  riskLabel(l: string): string {
    return l === 'LOW' ? 'Sous-charge' : l === 'OK' ? 'Optimal'
         : l === 'ELEVATED' ? 'Élevé' : l === 'HIGH' ? 'Risque' : '—';
  }
}
