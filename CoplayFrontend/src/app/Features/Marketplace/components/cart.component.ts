import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../services/marketplace.service';
import { Cart } from '../../../Core/Models/Marketplace/Cart';

@Component({
  selector: 'app-cart',
  template: `
    <div class="page route-enter">
      <div class="crumb-row">
        <button class="crumb-back" routerLink="/marketplace">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <span>Panier</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">Panier</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">Votre sélection</h1>
            <p style="color:var(--muted);max-width:560px;margin:10px 0 0;font-size:15px">
              {{ (cart?.items?.length || 0) }} article(s) prêt(s) à être commandés.
            </p>
          </div>
          <button class="btn-cp btn-ghost-cp" *ngIf="cart && cart.items.length > 0" (click)="clear()">
            <i class="bi bi-trash"></i> Vider
          </button>
        </div>
      </div>

      <div class="full" style="padding-top:24px">
        <div *ngIf="!cart || cart.items.length === 0" class="cp-empty" [cpReveal]="0">
          <i class="bi bi-cart-x"></i>
          <h4>Panier vide</h4>
          <p>Découvrez le catalogue pour ajouter vos premiers articles.</p>
          <button class="btn-cp btn-primary-cp" routerLink="/marketplace">Explorer</button>
        </div>

        <div class="row g-4" *ngIf="cart && cart.items.length > 0">
          <div class="col-lg-8">
            <div class="card-cp p-0" [cpReveal]="0">
              <div *ngFor="let i of cart.items; let last = last; let idx = index" class="d-flex align-items-center gap-3 p-3"
                   [style.border-bottom]="last ? 'none' : '1px solid var(--line)'"
                   [cpReveal]="idx * 40">
                <div style="width:90px;height:90px;border-radius:var(--radius);background:var(--line-strong);overflow:hidden;flex-shrink:0">
                  <img *ngIf="i.imageUrl" [src]="i.imageUrl" style="width:100%;height:100%;object-fit:cover">
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600">{{ i.name }}</div>
                  <div style="color:var(--muted);font-size:.8rem">{{ i.targetType }}</div>
                  <div class="display" style="font-size:1.4rem;margin-top:.4rem">{{ i.unitPrice }} €</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <button class="btn-cp btn-ghost-cp btn-sm-cp" (click)="setQty(i.targetId, i.quantity - 1)" [disabled]="i.quantity <= 1">−</button>
                  <span class="mono" style="min-width:24px;text-align:center;font-weight:600">{{ i.quantity }}</span>
                  <button class="btn-cp btn-ghost-cp btn-sm-cp" (click)="setQty(i.targetId, i.quantity + 1)">+</button>
                  <button class="btn-cp btn-danger-cp btn-sm-cp ms-2" (click)="remove(i.targetId)">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card-cp p-4" style="position:sticky;top:1rem" [cpReveal]="60">
              <div class="eyebrow" style="margin-bottom:1rem">Récapitulatif</div>
              <div class="d-flex justify-content-between mb-2">
                <span style="color:var(--muted)">Sous-total</span>
                <span class="mono">{{ subtotal() }} €</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span style="color:var(--muted)">Frais</span>
                <span class="mono">Calculés au paiement</span>
              </div>
              <div style="border-top:1px solid var(--line);margin:1rem 0"></div>
              <div class="d-flex justify-content-between align-items-end mb-4">
                <span class="eyebrow">Total</span>
                <span class="display" style="font-size:2rem">{{ subtotal() }} €</span>
              </div>
              <button class="btn-cp btn-primary-cp w-100" routerLink="/marketplace/checkout" style="padding:.75rem 1.5rem">
                <i class="bi bi-credit-card"></i> Passer commande
              </button>
              <button class="btn-cp btn-ghost-cp w-100 mt-2" routerLink="/marketplace">
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CartComponent implements OnInit {
  cart?: Cart;
  constructor(private mp: MarketplaceService, private router: Router) {}
  ngOnInit() { this.load(); }
  load() { this.mp.getCart().subscribe(c => this.cart = c); }
  subtotal() { return this.cart?.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) || 0; }
  setQty(id: string, q: number) { if (q < 1) return; this.mp.updateQuantity(id, q).subscribe(c => this.cart = c); }
  remove(id: string) { this.mp.removeFromCart(id).subscribe(c => this.cart = c); }
  clear() { if (confirm('Vider le panier ?')) this.mp.clearCart().subscribe(c => this.cart = c); }
}
