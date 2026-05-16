import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../services/marketplace.service';
import { ShippingAddress } from '../../../Core/Models/Marketplace/Order';

@Component({
  selector: 'app-checkout',
  template: `
    <div class="page route-enter">
      <div class="crumb-row">
        <button class="crumb-back" routerLink="/marketplace/cart">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <a routerLink="/marketplace/cart">Panier</a>
          <span>›</span>
          <span>Checkout</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">Paiement</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">Finaliser la commande</h1>
            <p style="color:var(--muted);max-width:560px;margin:10px 0 0;font-size:15px">
              Renseignez vos informations de livraison.
            </p>
          </div>
        </div>
      </div>

      <div class="full" style="padding-top:24px">
        <div class="row g-4">
          <div class="col-lg-8">
            <section class="card-cp p-4" [cpReveal]="0">
              <h3 class="display" style="font-size:1.2rem;margin-bottom:1rem">Adresse de livraison</h3>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Nom complet</label>
                    <input class="cp-field-input" [(ngModel)]="addr.fullName">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Téléphone</label>
                    <input class="cp-field-input" [(ngModel)]="addr.phone">
                  </div>
                </div>
                <div class="col-12">
                  <div class="cp-field">
                    <label class="cp-field-label">Adresse</label>
                    <input class="cp-field-input" [(ngModel)]="addr.line1" placeholder="N° et rue">
                  </div>
                </div>
                <div class="col-12">
                  <div class="cp-field">
                    <label class="cp-field-label">Complément (optionnel)</label>
                    <input class="cp-field-input" [(ngModel)]="addr.line2">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Ville</label>
                    <input class="cp-field-input" [(ngModel)]="addr.city">
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="cp-field">
                    <label class="cp-field-label">Code postal</label>
                    <input class="cp-field-input" [(ngModel)]="addr.postalCode">
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="cp-field">
                    <label class="cp-field-label">Pays</label>
                    <input class="cp-field-input" [(ngModel)]="addr.country">
                  </div>
                </div>
              </div>
            </section>

            <div class="d-flex gap-2 mt-3" [cpReveal]="60">
              <button class="btn-cp btn-ghost-cp" routerLink="/marketplace/cart">
                <i class="bi bi-arrow-left"></i> Retour panier
              </button>
              <button class="btn-cp btn-primary-cp" (click)="placeOrder()" [disabled]="loading" style="padding:.75rem 1.5rem">
                <i class="bi bi-lock-fill"></i> {{ loading ? 'Création...' : 'Confirmer & payer' }}
              </button>
            </div>

            <div *ngIf="result" class="card-cp p-4 mt-4" style="border-left:3px solid var(--success);background:rgba(0,230,118,.04)" [cpReveal]="0">
              <div class="d-flex align-items-center gap-2 mb-2" style="color:var(--success)">
                <i class="bi bi-check-circle-fill" style="font-size:1.5rem"></i>
                <strong>Commande créée</strong>
              </div>
              <p style="font-size:.9rem;margin-bottom:.5rem">Stripe ClientSecret reçu. Intégrez Stripe Elements pour confirmer le paiement.</p>
              <code class="mono" style="font-size:.72rem;word-break:break-all;display:block;background:var(--paper);padding:.5rem;border-radius:6px">{{ result.clientSecret }}</code>
              <button class="btn-cp btn-primary-cp mt-3" routerLink="/marketplace/orders">Voir mes commandes</button>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card-cp p-4" style="position:sticky;top:1rem" [cpReveal]="80">
              <div class="eyebrow" style="margin-bottom:1rem">Méthode de paiement</div>
              <label class="card-cp p-3 mb-2 d-flex align-items-center gap-3" style="cursor:pointer;border-color:var(--ink)">
                <input type="radio" name="pm" checked>
                <i class="bi bi-credit-card" style="font-size:1.3rem"></i>
                <div>
                  <div style="font-weight:600">Carte bancaire</div>
                  <div style="color:var(--muted);font-size:.78rem">Stripe sécurisé</div>
                </div>
              </label>

              <div style="border-top:1px solid var(--line);margin:1rem 0"></div>

              <div class="d-flex align-items-center gap-2 mb-2" style="font-size:.8rem;color:var(--muted)">
                <i class="bi bi-shield-check" style="color:var(--success)"></i>
                <span>Paiement crypté SSL</span>
              </div>
              <div class="d-flex align-items-center gap-2" style="font-size:.8rem;color:var(--muted)">
                <i class="bi bi-arrow-counterclockwise" style="color:var(--success)"></i>
                <span>Remboursement 14 jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent {
  addr: ShippingAddress = { fullName: '', phone: '', line1: '', city: '', postalCode: '', country: 'FR' };
  result: any = null;
  loading = false;
  constructor(private mp: MarketplaceService, private router: Router) {}

  placeOrder() {
    this.loading = true;
    this.mp.createOrder(this.addr).subscribe({
      next: order => this.mp.createPaymentIntent(order.orderId).subscribe({
        next: p => { this.result = p; this.loading = false; },
        error: () => this.loading = false,
      }),
      error: () => this.loading = false,
    });
  }
}
