import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CoachingService } from '../services/coaching.service';

@Component({
  selector: 'app-coach-detail',
  template: `
    <div class="page route-enter" *ngIf="profile; else loading">
      <div class="crumb-row">
        <div class="crumb">
          <a routerLink="/coaching">Coaching</a>
          <span>›</span>
          <a routerLink="/coaching/coaches">Coaches</a>
          <span>›</span>
          <span>{{ profile.userName || profile.userId }}</span>
        </div>
      </div>

      <!-- HERO COACH -->
      <section class="coach-hero">
        <div class="ch-left">
          <div class="ch-avatar">{{ initials(profile) }}</div>
        </div>
        <div class="ch-info">
          <div class="ch-badges">
            <span class="badge-cp" *ngIf="profile.verified">
              <i class="bi bi-patch-check-fill"></i> Vérifié
            </span>
            <span class="badge-cp">{{ profile.yearsExperience || 0 }} ans d'expérience</span>
            <span class="badge-cp" *ngIf="profile.city">
              <i class="bi bi-geo-alt"></i> {{ profile.city }}
            </span>
          </div>
          <h1 class="display ch-name">{{ profile.userName || 'Coach' }}</h1>
          <p class="ch-bio">{{ profile.bio || 'Pas de bio.' }}</p>

          <div class="ch-stats">
            <div class="stat">
              <div class="num">{{ avgRating | number:'1.1-1' }}</div>
              <div class="lbl">⭐ Note moyenne</div>
            </div>
            <div class="stat">
              <div class="num">{{ reviews.length }}</div>
              <div class="lbl">Avis</div>
            </div>
            <div class="stat">
              <div class="num">{{ services.length }}</div>
              <div class="lbl">Prestations</div>
            </div>
            <div class="stat" *ngIf="profile.hourlyRate">
              <div class="num">{{ profile.hourlyRate }}€</div>
              <div class="lbl">/heure</div>
            </div>
          </div>

          <div class="ch-cta">
            <button class="btn-cp btn-primary-cp" (click)="bookFirstService()" [disabled]="services.length === 0">
              <i class="bi bi-calendar-plus"></i> Réserver une session
            </button>
            <button class="btn-cp btn-ghost-cp" (click)="contactCoach()">
              <i class="bi bi-chat-dots"></i> Envoyer un message
            </button>
          </div>
        </div>
      </section>

      <!-- SPÉCIALITÉS + CERTIFS -->
      <section class="row-section ch-section">
        <div class="ch-grid">
          <div class="card-cp">
            <h3><i class="bi bi-bullseye"></i> Spécialités</h3>
            <div class="chip-list" *ngIf="profile.specialties?.length; else noSpec">
              <span class="chip" *ngFor="let s of profile.specialties">{{ s }}</span>
            </div>
            <ng-template #noSpec><p class="muted">Aucune spécialité renseignée.</p></ng-template>
          </div>

          <div class="card-cp">
            <h3><i class="bi bi-award"></i> Certifications</h3>
            <ul class="cert-list" *ngIf="profile.certifications?.length; else noCert">
              <li *ngFor="let c of profile.certifications">
                <i class="bi" [class]="c.verified ? 'bi-patch-check-fill verified' : 'bi-patch-question'"></i>
                <div>
                  <strong>{{ c.name }}</strong>
                  <small>{{ c.issuer }} · {{ c.year }}</small>
                </div>
              </li>
            </ul>
            <ng-template #noCert><p class="muted">Pas de certification déclarée.</p></ng-template>
          </div>

          <div class="card-cp">
            <h3><i class="bi bi-clock-history"></i> Créneaux disponibles</h3>
            <ul class="slot-list" *ngIf="profile.availability?.length; else noSlot">
              <li *ngFor="let a of profile.availability">
                <span class="day">{{ dayLabel(a.dayOfWeek) }}</span>
                <span class="hours">{{ a.startTime }} → {{ a.endTime }}</span>
              </li>
            </ul>
            <ng-template #noSlot><p class="muted">Pas de créneau publié.</p></ng-template>
          </div>
        </div>
      </section>

      <!-- PRESTATIONS MARKETPLACE -->
      <section class="row-section">
        <div class="ch-section-title">
          <div>
            <div class="eyebrow"><i class="bi bi-bag-heart"></i> Lien Coaching ↔ Marketplace</div>
            <h2 class="display ch-h2">Prestations à réserver</h2>
          </div>
        </div>

        <div *ngIf="services.length > 0" class="services-grid">
          <article class="svc-card" *ngFor="let s of services">
            <div class="svc-cat">{{ s.category }}</div>
            <h4>{{ s.name }}</h4>
            <p>{{ s.description }}</p>
            <div class="svc-foot">
              <span class="price">{{ s.price }} €</span>
              <button class="btn-cp btn-dark-cp" (click)="bookService(s)">Réserver</button>
            </div>
          </article>
        </div>

        <div *ngIf="services.length === 0" class="cp-empty">
          <i class="bi bi-bag-x"></i>
          <p>Ce coach n'a pas encore publié de prestation.</p>
        </div>
      </section>

      <!-- AVIS -->
      <section class="row-section">
        <div class="ch-section-title">
          <div>
            <div class="eyebrow"><i class="bi bi-star-half"></i> Réputation</div>
            <h2 class="display ch-h2">Avis ({{ reviews.length }})</h2>
          </div>
        </div>

        <div *ngIf="reviews.length > 0" class="reviews-grid">
          <article class="review-card" *ngFor="let r of reviews">
            <div class="rev-head">
              <div class="rev-stars">
                <i *ngFor="let i of [1,2,3,4,5]"
                   class="bi"
                   [class]="i <= r.rating ? 'bi-star-fill' : 'bi-star'"></i>
              </div>
              <span class="rev-author">{{ r.authorId | slice:0:8 }}…</span>
              <span class="rev-verified" *ngIf="r.verifiedPurchase">
                <i class="bi bi-patch-check"></i> Vérifié
              </span>
            </div>
            <p class="rev-body">{{ r.comment || '—' }}</p>
          </article>
        </div>

        <div *ngIf="reviews.length === 0" class="cp-empty">
          <i class="bi bi-chat-square-text"></i>
          <p>Pas encore d'avis. Sois le premier à laisser un retour après ta session.</p>
        </div>
      </section>
    </div>

    <ng-template #loading>
      <div class="loading"><i class="bi bi-hourglass-split"></i> Chargement du profil…</div>
    </ng-template>
  `,
  styles: [`
    .page { max-width: 1280px; margin: 0 auto; padding: 24px; }
    .crumb-row { margin-bottom: 24px; }
    .crumb { display: flex; gap: 6px; align-items: center; font-size: 13px; color: var(--muted); }
    .crumb a { color: var(--accent); text-decoration: none; }

    .coach-hero {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 32px;
      padding: 36px;
      background: linear-gradient(135deg, #0E1A2B, #1e293b);
      color: white;
      border-radius: 24px;
      margin-bottom: 32px;
    }
    .ch-avatar {
      width: 140px; height: 140px;
      border-radius: 32px;
      background: var(--accent);
      color: var(--navy);
      display: grid; place-items: center;
      font-size: 48px;
      font-weight: 800;
    }
    .ch-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .ch-name { font-size: clamp(36px, 5vw, 64px); margin: 0; }
    .ch-bio { color: #C7CFDC; max-width: 700px; margin: 12px 0 24px; }
    .ch-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      max-width: 600px;
      padding: 20px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 16px;
      margin-bottom: 24px;
    }
    .ch-stats .num { font-size: 28px; font-weight: 700; color: var(--accent); }
    .ch-stats .lbl { font-size: 11px; color: #94a3b8; letter-spacing: .08em; text-transform: uppercase; }
    .ch-cta { display: flex; gap: 10px; flex-wrap: wrap; }

    .ch-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 18px;
    }
    .ch-grid .card-cp { padding: 22px; }
    .ch-grid h3 { font-size: 16px; margin: 0 0 14px; display: flex; gap: 8px; align-items: center; }
    .chip-list { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { background: #f1f5f9; padding: 6px 12px; border-radius: 999px; font-size: 12px; }
    .cert-list, .slot-list { list-style: none; padding: 0; margin: 0; }
    .cert-list li {
      display: grid; grid-template-columns: 24px 1fr; gap: 10px; align-items: center;
      padding: 8px 0; border-bottom: 1px solid #f1f5f9;
    }
    .cert-list li:last-child { border-bottom: none; }
    .cert-list strong { display: block; font-size: 13px; }
    .cert-list small { color: var(--muted); font-size: 11px; }
    .verified { color: #16a34a; }
    .slot-list li {
      display: flex; justify-content: space-between; padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .slot-list .day { font-weight: 600; }
    .slot-list .hours { color: var(--muted); font-family: var(--font-mono); font-size: 13px; }
    .muted { color: var(--muted); font-size: 13px; }

    .ch-section { margin-bottom: 32px; }
    .ch-section-title { margin: 32px 0 18px; }
    .ch-h2 { font-size: 36px; margin: 6px 0 0; }
    .eyebrow { color: var(--accent); }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .svc-card { padding: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; }
    .svc-cat {
      display: inline-block; background: #ede9fe; color: #6d28d9;
      padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
      margin-bottom: 10px;
    }
    .svc-card h4 { margin: 0 0 8px; }
    .svc-card p { color: var(--muted); font-size: 13px; min-height: 40px; }
    .svc-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
    .svc-foot .price { font-size: 22px; font-weight: 700; color: var(--accent); }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 14px;
    }
    .review-card { padding: 18px; background: #f8fafc; border-radius: 12px; }
    .rev-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .rev-stars { color: #fbbf24; }
    .rev-stars i { font-size: 14px; }
    .rev-author { font-size: 12px; color: var(--muted); }
    .rev-verified { font-size: 11px; color: #16a34a; }
    .rev-body { font-size: 14px; color: #1e293b; margin: 0; }

    .cp-empty { padding: 40px; text-align: center; color: var(--muted); background: #f8fafc; border-radius: 14px; }
    .cp-empty i { font-size: 36px; display: block; margin-bottom: 8px; }
    .loading { padding: 60px; text-align: center; font-size: 18px; color: var(--muted); }
  `],
})
export class CoachDetailComponent implements OnInit {
  profile: any = null;
  services: any[] = [];
  reviews: any[] = [];
  avgRating = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cs: CoachingService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/coaching/coaches']); return; }

    // 1) Charge le profil coach
    this.http.get<any>(`http://localhost:8080/api/coaching/coach-profiles/${id}`).pipe(
      catchError(() => of(null)),
    ).subscribe(p => {
      if (!p) {
        // Fallback : essayer par userId
        this.http.get<any>(`http://localhost:8080/api/coaching/coach-profiles/user/${id}`).pipe(
          catchError(() => of(null)),
        ).subscribe(p2 => {
          this.profile = p2 || { userId: id, userName: 'Coach inconnu' };
          this.loadCrossModule(this.profile.userId);
        });
      } else {
        this.profile = p;
        this.loadCrossModule(p.userId);
      }
    });
  }

  /** Charge en parallèle les prestations marketplace et les avis (cross-module). */
  loadCrossModule(userId: string) {
    if (!userId) return;
    forkJoin({
      services: this.http.get<any[]>(`http://localhost:8080/api/marketplace/services/provider/${userId}`).pipe(catchError(() => of([]))),
      reviews: this.http.get<any[]>('http://localhost:8080/api/marketplace/reviews', {
        params: { targetId: userId, targetType: 'COACH' },
      }).pipe(catchError(() => of([]))),
    }).subscribe(({ services, reviews }) => {
      this.services = services || [];
      this.reviews = reviews || [];
      this.avgRating = this.reviews.length
        ? this.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / this.reviews.length
        : 0;
    });
  }

  bookFirstService() {
    if (this.services.length === 0) return;
    this.bookService(this.services[0]);
  }

  bookService(s: any) {
    this.router.navigate(['/marketplace/equipment', s.serviceId]);
  }

  contactCoach() {
    // Module Messaging existant — redirect avec userId en query
    this.router.navigate(['/messaging'], { queryParams: { to: this.profile?.userId } });
  }

  initials(p: any): string {
    const name = p.userName || p.userId || '?';
    return name.substring(0, 2).toUpperCase();
  }

  dayLabel(d: string): string {
    const m: Record<string, string> = {
      MON: 'Lundi', TUE: 'Mardi', WED: 'Mercredi', THU: 'Jeudi',
      FRI: 'Vendredi', SAT: 'Samedi', SUN: 'Dimanche',
    };
    return m[d] || d;
  }
}
