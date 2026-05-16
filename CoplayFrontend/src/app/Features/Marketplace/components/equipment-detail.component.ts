import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketplaceService } from '../services/marketplace.service';
import { Equipment } from '../../../Core/Models/Marketplace/Equipment';
import { Review } from '../../../Core/Models/Marketplace/Review';

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
            <button class="btn-cp btn-ghost-cp" (click)="toggleFav()">
              <i class="bi" [class.bi-heart]="!favorite" [class.bi-heart-fill]="favorite"></i>
              {{ favorite ? 'Favori' : 'Ajouter aux favoris' }}
            </button>
            <button class="btn-cp btn-primary-cp" (click)="addToCart()">
              <i class="bi bi-cart-plus"></i> Ajouter au panier
            </button>
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
                <button class="btn-cp btn-ghost-cp" (click)="negotiate()">
                  <i class="bi bi-chat-dots"></i> Négocier
                </button>
              </div>

              <div *ngIf="aiPrice !== null" class="mt-3 p-3" style="background:rgba(0,230,118,.08);border-radius:var(--radius);font-size:.9rem;border-left:3px solid var(--accent)">
                <strong style="color:var(--accent)"><i class="bi bi-stars"></i> Estimation IA :</strong>
                <span class="display ms-2" style="font-size:1.5rem">{{ aiPrice }} €</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <section class="mt-5">
          <div style="border-top:1px solid var(--line)"></div>
          <h3 class="display" style="margin:1.5rem 0">Avis ({{ reviews.length }})</h3>

          <div class="card-cp p-4 mb-3" [cpReveal]="100">
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

          <div class="card-cp p-4 mb-3" *ngFor="let r of reviews; let i = index" [cpReveal]="i * 40">
            <div class="d-flex justify-content-between mb-2">
              <div>
                <i class="bi bi-star-fill" *ngFor="let n of stars(r.rating)" style="color:var(--warning)"></i>
              </div>
              <span class="badge-cp" style="background:rgba(0,230,118,.12);color:var(--success)" *ngIf="r.verifiedPurchase">
                <i class="bi bi-patch-check-fill"></i> Achat vérifié
              </span>
            </div>
            <p class="mb-2" style="font-size:.95rem">{{ r.comment }}</p>
            <div class="mono" style="font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">
              <i class="bi bi-hand-thumbs-up"></i> {{ r.helpfulVotes }} utiles
            </div>
          </div>

          <div *ngIf="reviews.length === 0" class="cp-empty">
            <i class="bi bi-chat-square-quote"></i>
            <h4>Aucun avis</h4>
            <p>Soyez le premier à donner votre avis.</p>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class EquipmentDetailComponent implements OnInit {
  equipment?: Equipment;
  reviews: Review[] = [];
  aiPrice: number | null = null;
  estimating = false;
  favorite = false;
  newRating = 5;
  newComment = '';
  activeImg = '';

  constructor(private route: ActivatedRoute, private router: Router, private mp: MarketplaceService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mp.getEquipment(id).subscribe(e => this.equipment = e);
    this.mp.listReviews(id, 'EQUIPMENT').subscribe(r => this.reviews = r);
  }

  estimatePrice() {
    if (!this.equipment?.equipmentId) return;
    this.estimating = true;
    this.mp.estimatePrice(this.equipment.equipmentId).subscribe({
      next: r => { this.aiPrice = r.estimatedPrice; this.estimating = false; },
      error: () => this.estimating = false,
    });
  }

  addToCart() {
    if (!this.equipment?.equipmentId) return;
    this.mp.addToCart(this.equipment.equipmentId, 'EQUIPMENT', 1).subscribe(() => this.router.navigate(['/marketplace/cart']));
  }

  toggleFav() {
    if (!this.equipment?.equipmentId) return;
    this.mp.toggleFavorite(this.equipment.equipmentId, 'EQUIPMENT').subscribe(r => this.favorite = r.favorite);
  }

  negotiate() {
    if (!this.equipment?.equipmentId) return;
    this.mp.startNegotiation(this.equipment.equipmentId, 'EQUIPMENT').subscribe(() => alert('Négociation démarrée'));
  }

  postReview() {
    if (!this.equipment?.equipmentId) return;
    this.mp.createReview({
      targetId: this.equipment.equipmentId, targetType: 'EQUIPMENT',
      rating: this.newRating, comment: this.newComment
    }).subscribe(() => {
      this.newComment = '';
      this.mp.listReviews(this.equipment!.equipmentId!, 'EQUIPMENT').subscribe(r => this.reviews = r);
    });
  }

  stars(n: number) { return Array(n).fill(0); }
  labelCondition(c?: string) { return c === 'NEW' ? 'Neuf' : c === 'USED' ? 'Occasion' : c === 'REFURBISHED' ? 'Reconditionné' : c; }
}
