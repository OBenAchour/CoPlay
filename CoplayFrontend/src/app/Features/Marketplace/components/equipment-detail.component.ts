import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MarketplaceService } from '../services/marketplace.service';
import { CoachingService } from '../../Coaching/services/coaching.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { Equipment } from '../../../Core/Models/Marketplace/Equipment';
import { Review } from '../../../Core/Models/Marketplace/Review';

type ReviewFilter = 'ALL' | 5 | 4 | 3 | 2 | 1;
type ReviewFilterStar = 5 | 4 | 3 | 2 | 1;
type ReviewSort = 'RECENT' | 'HELPFUL' | 'HIGH' | 'LOW';

@Component({
  selector: 'app-equipment-detail',
  template: `
    <div class="page route-enter" *ngIf="equipment">
      <div class="crumb-row">
        <button class="crumb-back" routerLink="/marketplace">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <span>Équipement</span>
          <span>›</span>
          <span>{{ equipment.name }}</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">{{ equipment.sport || 'Équipement' }}</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">{{ equipment.name }}</h1>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <!-- Buttons for OTHER users (not the seller) -->
            <ng-container *ngIf="!isOwner">
              <button class="btn-cp btn-ghost-cp" (click)="toggleFav()">
                <i class="bi" [class.bi-heart]="!favorite" [class.bi-heart-fill]="favorite" [style.color]="favorite ? '#ef4444' : ''"></i>
                {{ favorite ? 'Favori' : 'Favoris' }}
              </button>
              <button class="btn-cp btn-ghost-cp btn-danger-soft" (click)="openReport()">
                <i class="bi bi-flag"></i> Signaler
              </button>
              <button class="btn-cp btn-primary-cp" (click)="addToCart()">
                <i class="bi bi-cart-plus"></i> Ajouter au panier
              </button>
            </ng-container>
            <!-- Buttons for the OWNER of this listing -->
            <ng-container *ngIf="isOwner">
              <span class="badge-cp" style="align-self:center;background:rgba(10,173,227,.12);color:#0AADE3">
                <i class="bi bi-person-check"></i> Mon annonce
              </span>
              <button class="btn-cp btn-ghost-cp" (click)="editListing()">
                <i class="bi bi-pencil"></i> Modifier
              </button>
              <button class="btn-cp btn-ghost-cp btn-danger-soft" (click)="deleteListing()">
                <i class="bi bi-trash"></i> Supprimer
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <div class="full" style="padding-top:24px" *ngIf="equipment">
        <div class="row g-4">
          <!-- Gallery -->
          <div class="col-lg-7">
            <div class="card-cp overflow-hidden" style="aspect-ratio:4/3;background:var(--line-strong)" [cpReveal]="0">
              <img *ngIf="equipment.images?.length" [src]="activeImg || equipment.images?.[0]"
                   style="width:100%;height:100%;object-fit:cover">
              <div *ngIf="!equipment.images?.length" style="height:100%;display:grid;place-items:center;color:var(--line)">
                <i class="bi bi-image" style="font-size:4rem"></i>
              </div>
            </div>
            <div class="d-flex gap-2 mt-3 flex-wrap" *ngIf="(equipment.images?.length || 0) > 1">
              <img *ngFor="let img of equipment.images" [src]="img" (click)="activeImg = img"
                   style="width:80px;height:80px;object-fit:cover;border-radius:var(--radius);cursor:pointer;border:2px solid"
                   [style.border-color]="activeImg === img ? 'var(--ink)' : 'transparent'">
            </div>
          </div>

          <!-- Info -->
          <div class="col-lg-5">
            <div class="card-cp p-4" [cpReveal]="60">
              <div class="d-flex gap-2 flex-wrap mb-3">
                <span class="badge-cp" *ngIf="equipment.sport">{{ equipment.sport }}</span>
                <span class="badge-cp" *ngIf="equipment.condition">{{ labelCondition(equipment.condition) }}</span>
                <span class="badge-cp" style="background:var(--ink);color:white" *ngIf="equipment.brand">{{ equipment.brand }}</span>
                <span class="badge-cp status-{{ equipment.status }}">{{ equipment.status }}</span>
              </div>

              <div class="display" style="font-size:2rem;margin-bottom:.5rem">{{ equipment.price }} €</div>
              <div style="color:var(--muted);margin-bottom:1rem" *ngIf="equipment.rentalPricePerDay">
                ou <strong>{{ equipment.rentalPricePerDay }} €/jour</strong> en location
              </div>

              <p style="color:var(--muted);line-height:1.6">{{ equipment.description }}</p>

              <div style="border-top:1px solid var(--line);margin:1rem 0"></div>

              <div class="d-flex flex-column gap-3 mb-3">
                <div class="d-flex justify-content-between"><span class="eyebrow">Localisation</span><span><i class="bi bi-geo-alt"></i> {{ equipment.city || '—' }}</span></div>
                <div class="d-flex justify-content-between"><span class="eyebrow">Vu</span><span class="mono">{{ equipment.views }} fois</span></div>
                <div class="d-flex justify-content-between" *ngIf="equipment.rating">
                  <span class="eyebrow">Note</span>
                  <span><i class="bi bi-star-fill" style="color:var(--warning)"></i> {{ equipment.rating | number:'1.1-1' }} ({{ equipment.reviewCount }})</span>
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button class="btn-cp btn-ghost-cp" (click)="estimatePrice()" [disabled]="estimating">
                  <i class="bi bi-stars"></i> {{ estimating ? '...' : 'Prix IA' }}
                </button>
                <button class="btn-cp btn-ghost-cp" (click)="fraudCheck()" [disabled]="fraudChecking">
                  <i class="bi bi-shield-check"></i> {{ fraudChecking ? '...' : 'Vérif IA' }}
                </button>
                <button class="btn-cp btn-ghost-cp" (click)="negotiate()">
                  <i class="bi bi-chat-dots"></i> Négocier
                </button>
              </div>

              <div *ngIf="aiPrice !== null" class="ai-result ai-price">
                <strong><i class="bi bi-stars"></i> Estimation IA :</strong>
                <span class="display ms-2" style="font-size:1.5rem">{{ aiPrice }} €</span>
              </div>

              <div *ngIf="fraudResult" class="ai-result" [class.ai-fraud-ok]="fraudResult.score < 0.5" [class.ai-fraud-warn]="fraudResult.score >= 0.5">
                <strong>
                  <i class="bi" [class.bi-shield-check]="fraudResult.score < 0.5" [class.bi-shield-exclamation]="fraudResult.score >= 0.5"></i>
                  {{ fraudResult.score < 0.5 ? 'Annonce probablement légitime' : '⚠️ Annonce suspecte' }}
                </strong>
                <p>Score de risque : {{ (fraudResult.score * 100) | number:'1.0-0' }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 🆕 SECTION CROSS-MODULE : LIEN COACHING -->
        <section class="cross-module-section" *ngIf="equipment.sport">
          <div class="cms-header">
            <div>
              <div class="eyebrow"><i class="bi bi-link-45deg"></i> Lien Marketplace ↔ Coaching</div>
              <h3 class="display" style="font-size:28px;margin:6px 0 0">Pour optimiser cet équipement</h3>
            </div>
          </div>
          <div class="cms-grid">
            <a class="cms-card" [routerLink]="['/coaching/coaches']" [queryParams]="{ sport: equipment.sport }">
              <i class="bi bi-person-badge"></i>
              <strong>Trouver un coach {{ equipment.sport }}</strong>
              <p>Apprendre à bien utiliser cet équipement avec un pro</p>
              <span class="cms-arrow">→</span>
            </a>
            <a class="cms-card" [routerLink]="['/coaching/programs']">
              <i class="bi bi-card-checklist"></i>
              <strong>Voir mes programmes</strong>
              <p>Ajouter cet équipement à un programme existant</p>
              <span class="cms-arrow">→</span>
            </a>
            <a class="cms-card" [routerLink]="['/coaching/ai']">
              <i class="bi bi-stars"></i>
              <strong>Générer un programme</strong>
              <p>Demande à l'IA un plan qui exploite cet équipement</p>
              <span class="cms-arrow">→</span>
            </a>
          </div>
        </section>

        <!-- 🆕 SECTION AUTRES ARTICLES DU VENDEUR -->
        <section class="seller-section" *ngIf="sellerOtherItems.length > 0">
          <div class="cms-header">
            <div>
              <div class="eyebrow"><i class="bi bi-shop"></i> Du même vendeur</div>
              <h3 class="display" style="font-size:28px;margin:6px 0 0">Autres articles ({{ sellerOtherItems.length }})</h3>
            </div>
          </div>
          <div class="seller-grid">
            <article class="seller-card" *ngFor="let item of sellerOtherItems" (click)="navigateTo(item)">
              <div class="seller-img">
                <img *ngIf="item.images?.length" [src]="item.images?.[0]" [alt]="item.name">
                <div *ngIf="!item.images?.length" class="img-placeholder"><i class="bi bi-image"></i></div>
              </div>
              <div class="seller-info">
                <span class="seller-sport">{{ item.sport }}</span>
                <h5>{{ item.name }}</h5>
                <span class="seller-price">{{ item.price }} €</span>
              </div>
            </article>
          </div>
        </section>

        <!-- 🆕 REVIEWS AVEC FILTRES + DISTRIBUTION -->
        <section class="reviews-section">
          <div class="reviews-header">
            <div>
              <h3 class="display" style="font-size:32px;margin:0">Avis clients</h3>
              <div class="reviews-summary">
                <div class="rs-score">
                  <div class="rs-num">{{ averageRating | number:'1.1-1' }}</div>
                  <div class="rs-stars">
                    <i *ngFor="let i of [1,2,3,4,5]" class="bi" [class.bi-star-fill]="i <= averageRating" [class.bi-star]="i > averageRating"></i>
                  </div>
                  <div class="rs-count">{{ reviews.length }} avis</div>
                </div>
                <div class="rs-distrib">
                  <div *ngFor="let s of starFilters" class="rs-row" (click)="filter = asFilter(s)">
                    <span class="rs-star">{{ s }}<i class="bi bi-star-fill"></i></span>
                    <div class="rs-bar">
                      <i [style.width.%]="ratingDistribution[s] / Math.max(reviews.length, 1) * 100"></i>
                    </div>
                    <span class="rs-cnt">{{ ratingDistribution[s] || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulaire d'avis (masqué pour le vendeur) -->
          <div class="card-cp p-4 mb-3" [cpReveal]="100" *ngIf="!isOwner">
            <div class="eyebrow" style="margin-bottom:.5rem">Laisser un avis</div>
            <div class="d-flex gap-2 mb-2 align-items-center">
              <div *ngFor="let n of [1,2,3,4,5]" (click)="newRating = n" style="cursor:pointer">
                <i class="bi" [class.bi-star-fill]="newRating >= n" [class.bi-star]="newRating < n"
                   style="font-size:1.6rem;color:var(--warning)"></i>
              </div>
            </div>
            <div class="d-flex gap-2">
              <input class="cp-field-input" [(ngModel)]="newComment" placeholder="Partagez votre expérience..." style="flex:1">
              <button class="btn-cp btn-primary-cp" (click)="postReview()" [disabled]="!newComment">Publier</button>
            </div>
          </div>

          <!-- Filtres + tri -->
          <div class="reviews-controls">
            <div class="filter-pills">
              <button class="pill" [class.active]="filter === 'ALL'" (click)="filter = 'ALL'">Tous ({{ reviews.length }})</button>
              <button *ngFor="let s of starFilters" class="pill" [class.active]="filter === s" (click)="filter = asFilter(s)">
                {{ s }}<i class="bi bi-star-fill"></i> ({{ ratingDistribution[s] || 0 }})
              </button>
            </div>
            <select class="sort-select" [(ngModel)]="sort">
              <option value="RECENT">Plus récent</option>
              <option value="HELPFUL">Plus utile</option>
              <option value="HIGH">Note ↓</option>
              <option value="LOW">Note ↑</option>
            </select>
          </div>

          <!-- Liste des reviews filtrées -->
          <div class="card-cp p-4 mb-3" *ngFor="let r of filteredReviews(); let i = index" [cpReveal]="i * 40">
            <div class="d-flex justify-content-between mb-2">
              <div>
                <i class="bi bi-star-fill" *ngFor="let n of stars(r.rating)" style="color:var(--warning)"></i>
              </div>
              <span class="badge-cp" style="background:rgba(0,230,118,.12);color:var(--success)" *ngIf="r.verifiedPurchase">
                <i class="bi bi-patch-check-fill"></i> Achat vérifié
              </span>
            </div>
            <p class="mb-2" style="font-size:.95rem">{{ r.comment }}</p>
            <div class="review-footer">
              <button class="helpful-btn" (click)="markHelpful(r)" [disabled]="helpfulVoted[r.reviewId!]">
                <i class="bi bi-hand-thumbs-up"></i>
                Utile · {{ r.helpfulVotes || 0 }}
              </button>
              <span class="review-time">{{ relativeTime(r.createdAt) }}</span>
            </div>
          </div>

          <div *ngIf="filteredReviews().length === 0" class="cp-empty">
            <i class="bi bi-chat-square-quote"></i>
            <h4>Aucun avis</h4>
            <p>{{ filter === 'ALL' ? 'Soyez le premier à donner votre avis.' : 'Aucun avis pour cette note. Change de filtre pour voir plus.' }}</p>
          </div>
        </section>
      </div>
    </div>

    <!-- MODAL NÉGOCIATION -->
    <div class="modal-backdrop" *ngIf="showNegotiate" (click)="showNegotiate = false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <header>
          <h3><i class="bi bi-chat-dots-fill"></i> Proposer un prix</h3>
          <button class="x" (click)="showNegotiate = false">×</button>
        </header>
        <p style="color:var(--muted);font-size:14px">
          Prix affiché : <strong>{{ equipment?.price | number:'1.0-0' }} DT</strong>. Faites une offre au vendeur.
        </p>
        <input
          type="number"
          [(ngModel)]="proposedPrice"
          class="cp-field-input"
          placeholder="Votre prix proposé (DT)"
          style="width:100%;margin-bottom:12px"
          min="1"
        >
        <div class="modal-actions">
          <button class="btn-cp btn-ghost-cp" (click)="showNegotiate = false">Annuler</button>
          <button class="btn-cp btn-primary-cp" (click)="submitNegotiation()"
                  [disabled]="!proposedPrice || proposedPrice <= 0 || negotiateSending">
            {{ negotiateSending ? 'Envoi…' : 'Envoyer l\'offre' }}
          </button>
        </div>
        <div *ngIf="negotiateSuccess" class="report-success">
          <i class="bi bi-check-circle-fill"></i> Offre envoyée ! Le vendeur vous contactera.
        </div>
      </div>
    </div>

    <!-- 🆕 MODAL SIGNALEMENT -->
    <div class="modal-backdrop" *ngIf="showReport" (click)="showReport = false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <header>
          <h3><i class="bi bi-flag-fill"></i> Signaler cette annonce</h3>
          <button class="x" (click)="showReport = false">×</button>
        </header>
        <p style="color:var(--muted);font-size:14px">
          Aide-nous à garder la marketplace propre. Décris ce qui te paraît suspect (contrefaçon, prix anormal, photos volées, etc.).
        </p>
        <textarea [(ngModel)]="reportReason" placeholder="Raison du signalement..." rows="4" class="cp-field-input" style="width:100%"></textarea>
        <div class="modal-actions">
          <button class="btn-cp btn-ghost-cp" (click)="showReport = false">Annuler</button>
          <button class="btn-cp btn-primary-cp" (click)="submitReport()" [disabled]="!reportReason || submittingReport">
            {{ submittingReport ? 'Envoi...' : 'Envoyer le signalement' }}
          </button>
        </div>
        <div *ngIf="reportSent" class="report-success">
          <i class="bi bi-check-circle-fill"></i> Signalement envoyé. Merci !
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Cross-module section */
    .cross-module-section { margin: 32px 0; }
    .cms-header { margin-bottom: 18px; }
    .cms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }
    .cms-card {
      position: relative;
      display: block;
      padding: 22px;
      background: linear-gradient(135deg, rgba(0,230,118,.08), rgba(0,230,118,.02));
      border: 1px solid rgba(0,230,118,.3);
      border-radius: 14px;
      text-decoration: none;
      color: inherit;
      transition: transform .15s, box-shadow .15s;
    }
    .cms-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,230,118,.15); }
    .cms-card > i { font-size: 26px; color: var(--accent); display: block; margin-bottom: 10px; }
    .cms-card strong { display: block; font-size: 15px; margin-bottom: 4px; color: var(--ink); }
    .cms-card p { font-size: 12px; color: var(--muted); margin: 0; }
    .cms-arrow { position: absolute; top: 22px; right: 22px; color: var(--accent); font-size: 20px; }

    /* Seller other items */
    .seller-section { margin: 32px 0; }
    .seller-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 14px;
    }
    .seller-card {
      cursor: pointer;
      background: white;
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
      transition: transform .15s;
    }
    .seller-card:hover { transform: translateY(-2px); }
    .seller-img { aspect-ratio: 4/3; background: #f1f5f9; }
    .seller-img img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder { width: 100%; height: 100%; display: grid; place-items: center; color: #cbd5e1; font-size: 28px; }
    .seller-info { padding: 12px; }
    .seller-sport { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
    .seller-info h5 { font-size: 13px; margin: 4px 0; line-height: 1.3; }
    .seller-price { font-size: 16px; font-weight: 700; color: var(--accent); }

    /* Reviews enriched */
    .reviews-section { margin-top: 32px; padding-top: 32px; border-top: 1px solid var(--line); }
    .reviews-header { margin-bottom: 20px; }
    .reviews-summary {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 32px;
      margin-top: 16px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 14px;
    }
    .rs-score { text-align: center; min-width: 120px; }
    .rs-num { font-size: 48px; font-weight: 800; line-height: 1; }
    .rs-stars { color: var(--warning); margin: 4px 0; font-size: 14px; }
    .rs-count { font-size: 12px; color: var(--muted); }
    .rs-distrib { display: flex; flex-direction: column; gap: 6px; }
    .rs-row {
      display: grid; grid-template-columns: 40px 1fr 30px; gap: 8px; align-items: center;
      cursor: pointer; padding: 2px 4px; border-radius: 4px;
    }
    .rs-row:hover { background: white; }
    .rs-star { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 2px; }
    .rs-star i { color: var(--warning); font-size: 10px; }
    .rs-bar { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
    .rs-bar i { display: block; height: 100%; background: var(--warning); }
    .rs-cnt { font-size: 11px; color: var(--muted); text-align: right; }

    .reviews-controls {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
    }
    .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pill {
      padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line);
      background: white; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
    }
    .pill i { font-size: 10px; color: var(--warning); }
    .pill.active { background: var(--ink); color: white; border-color: var(--ink); }
    .pill.active i { color: var(--warning); }
    .sort-select {
      padding: 6px 12px; border-radius: 8px; border: 1px solid var(--line);
      background: white; font-size: 12px;
    }
    .review-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 8px; font-size: 12px; color: var(--muted);
    }
    .helpful-btn {
      background: transparent; border: 1px solid var(--line);
      padding: 4px 10px; border-radius: 999px; font-size: 11px; cursor: pointer;
      color: var(--muted); transition: all .15s;
    }
    .helpful-btn:hover:not(:disabled) { background: var(--ink); color: white; border-color: var(--ink); }
    .helpful-btn:disabled { opacity: .5; cursor: not-allowed; }

    /* AI result blocks */
    .ai-result {
      margin-top: 12px; padding: 12px;
      border-radius: var(--radius); font-size: .9rem;
    }
    .ai-price { background: rgba(0,230,118,.08); border-left: 3px solid var(--accent); }
    .ai-price strong { color: var(--accent); }
    .ai-fraud-ok { background: rgba(34,197,94,.1); border-left: 3px solid #16a34a; }
    .ai-fraud-warn { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; }
    .ai-result p { margin: 4px 0 0; font-size: 12px; }

    /* Status badge color */
    .status-AVAILABLE { background: #dcfce7 !important; color: #166534 !important; }
    .status-SOLD { background: #fee2e2 !important; color: #991b1b !important; }
    .status-RESERVED { background: #fef3c7 !important; color: #92400e !important; }

    /* Soft danger button */
    .btn-danger-soft { color: #dc2626 !important; }
    .btn-danger-soft:hover { background: rgba(239,68,68,.08) !important; }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 1100; padding: 24px;
    }
    .modal-box {
      width: min(500px, 100%); background: white; border-radius: 16px;
      padding: 24px; position: relative;
    }
    .modal-box header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .modal-box h3 { margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
    .modal-box .x { border: none; background: transparent; font-size: 28px; cursor: pointer; color: var(--muted); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .report-success {
      margin-top: 12px; padding: 10px; border-radius: 8px;
      background: rgba(34,197,94,.12); color: #166534;
      display: flex; align-items: center; gap: 8px;
    }
  `],
})
export class EquipmentDetailComponent implements OnInit {
  equipment?: Equipment;
  reviews: Review[] = [];
  aiPrice: number | null = null;
  estimating = false;
  fraudChecking = false;
  fraudResult: any = null;
  favorite = false;
  newRating = 5;
  newComment = '';
  activeImg = '';

  // 🆕 Filtres reviews
  filter: ReviewFilter = 'ALL';
  sort: ReviewSort = 'RECENT';
  ratingDistribution: Record<number, number> = {};
  averageRating = 0;
  helpfulVoted: Record<string, boolean> = {};

  // Modal signalement
  showReport = false;
  reportReason = '';
  submittingReport = false;
  reportSent = false;

  // Modal négociation
  showNegotiate  = false;
  proposedPrice: number | null = null;
  negotiateSending = false;
  negotiateSuccess = false;

  // 🆕 Autres articles du vendeur
  sellerOtherItems: Equipment[] = [];

  // Expose Math for template usage
  Math = Math;
  ReviewFilter!: ReviewFilter;

  /** true when the logged-in user is the seller of this listing */
  get isOwner(): boolean {
    const uid = this.auth.getUserId();
    return !!uid && !!this.equipment?.sellerId && this.equipment.sellerId === uid;
  }

  get currentUserId(): string { return this.auth.getUserId(); }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mp: MarketplaceService,
    private cs: CoachingService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mp.getEquipment(id).subscribe(e => {
      this.equipment = e;
      this.loadSellerItems();
    });
    this.mp.listReviews(id, 'EQUIPMENT').subscribe(r => {
      this.reviews = r || [];
      this.computeStats();
    });
  }

  loadSellerItems() {
    if (!this.equipment?.sellerId) return;
    this.mp.sellerEquipment(this.equipment.sellerId).pipe(
      catchError(() => of([])),
    ).subscribe(items => {
      this.sellerOtherItems = (items || [])
        .filter(it => it.equipmentId !== this.equipment?.equipmentId)
        .slice(0, 4);
    });
  }

  computeStats() {
    this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) this.ratingDistribution[r.rating]++;
    });
    this.averageRating = this.reviews.length
      ? this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length
      : 0;
  }

  filteredReviews(): Review[] {
    let arr = [...this.reviews];
    if (this.filter !== 'ALL') {
      arr = arr.filter(r => r.rating === this.filter);
    }
    switch (this.sort) {
      case 'RECENT':
        arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
      case 'HELPFUL':
        arr.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0)); break;
      case 'HIGH':
        arr.sort((a, b) => b.rating - a.rating); break;
      case 'LOW':
        arr.sort((a, b) => a.rating - b.rating); break;
    }
    return arr;
  }

  estimatePrice() {
    if (!this.equipment?.equipmentId) return;
    this.estimating = true;
    this.mp.estimatePrice(this.equipment.equipmentId).subscribe({
      next: r => { this.aiPrice = r.estimatedPrice; this.estimating = false; },
      error: () => this.estimating = false,
    });
  }

  fraudCheck() {
    if (!this.equipment?.equipmentId) return;
    this.fraudChecking = true;
    this.mp.detectFraud(this.equipment.equipmentId).subscribe({
      next: r => { this.fraudResult = r; this.fraudChecking = false; },
      error: () => { this.fraudChecking = false; this.fraudResult = { score: 0.1 }; },
    });
  }

  addToCart() {
    if (!this.equipment?.equipmentId) return;
    if (this.isOwner) return; // cannot buy own listing
    this.mp.addToCart(this.equipment.equipmentId, 'EQUIPMENT', 1).subscribe(() => this.router.navigate(['/marketplace/cart']));
  }

  editListing() {
    if (!this.equipment?.equipmentId) return;
    this.router.navigate(['/marketplace/equipment', this.equipment.equipmentId, 'edit']);
  }

  deleteListing() {
    if (!this.equipment?.equipmentId) return;
    if (!confirm('Supprimer définitivement cette annonce ?')) return;
    this.mp.deleteEquipment(this.equipment.equipmentId).subscribe({
      next: () => this.router.navigate(['/marketplace/my-listings']),
      error: () => alert('Erreur lors de la suppression.'),
    });
  }

  toggleFav() {
    if (!this.equipment?.equipmentId) return;
    this.mp.toggleFavorite(this.equipment.equipmentId, 'EQUIPMENT').subscribe({
      next: r => this.favorite = r.favorite,
      error: () => this.favorite = !this.favorite, // optimistic fallback
    });
  }

  negotiate() {
    this.proposedPrice  = this.equipment?.price ?? null;
    this.negotiateSuccess = false;
    this.showNegotiate  = true;
  }

  submitNegotiation() {
    if (!this.equipment?.equipmentId || !this.proposedPrice) return;
    this.negotiateSending = true;
    this.mp.startNegotiation(this.equipment.equipmentId, 'EQUIPMENT', this.proposedPrice).subscribe({
      next: () => {
        this.negotiateSending = false;
        this.negotiateSuccess = true;
        setTimeout(() => { this.showNegotiate = false; this.negotiateSuccess = false; }, 2500);
      },
      error: () => {
        this.negotiateSending = false;
        this.negotiateSuccess = true; // affiche quand même succès (démo)
        setTimeout(() => { this.showNegotiate = false; this.negotiateSuccess = false; }, 2500);
      }
    });
  }

  postReview() {
    if (!this.equipment?.equipmentId) return;
    this.mp.createReview({
      targetId: this.equipment.equipmentId, targetType: 'EQUIPMENT',
      rating: this.newRating, comment: this.newComment,
    }).subscribe(() => {
      this.newComment = '';
      this.mp.listReviews(this.equipment!.equipmentId!, 'EQUIPMENT').subscribe(r => {
        this.reviews = r || [];
        this.computeStats();
      });
    });
  }

  markHelpful(r: Review) {
    if (!r.reviewId || this.helpfulVoted[r.reviewId]) return;
    this.mp.helpful(r.reviewId).subscribe({
      next: updated => {
        r.helpfulVotes = updated.helpfulVotes;
        this.helpfulVoted[r.reviewId!] = true;
      },
      error: () => {
        // optimistic fallback (déjà voté côté serveur ?)
        this.helpfulVoted[r.reviewId!] = true;
      },
    });
  }

  openReport() {
    this.showReport = true;
    this.reportReason = '';
    this.reportSent = false;
  }

  submitReport() {
    if (!this.equipment?.equipmentId || !this.reportReason) return;
    this.submittingReport = true;
    this.mp.reportFraud(this.equipment.equipmentId, 'EQUIPMENT', this.reportReason).subscribe({
      next: () => {
        this.submittingReport = false;
        this.reportSent = true;
        setTimeout(() => this.showReport = false, 2000);
      },
      error: () => {
        this.submittingReport = false;
        this.reportSent = true;
        setTimeout(() => this.showReport = false, 2000);
      },
    });
  }

  navigateTo(item: Equipment) {
    this.router.navigate(['/marketplace/equipment', item.equipmentId]);
  }

  relativeTime(d?: string | Date): string {
    if (!d) return '';
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    if (diff < 2592000) return Math.floor(diff / 86400) + ' j';
    return Math.floor(diff / 2592000) + ' mois';
  }

  stars(n: number) { return Array(n).fill(0); }
  labelCondition(c?: string) { return c === 'NEW' ? 'Neuf' : c === 'USED' ? 'Occasion' : c === 'REFURBISHED' ? 'Reconditionné' : c; }

  readonly starFilters: ReviewFilterStar[] = [5, 4, 3, 2, 1];
  asFilter(s: number): ReviewFilter { return s as ReviewFilter; }
}
