import { Component } from '@angular/core';
import { MarketplaceService } from '../services/marketplace.service';
import { ShippingAddress } from '../../../Core/Models/Marketplace/Order';

/** Checkout steps: address → payment form → success */
type CheckoutStep = 'address' | 'payment' | 'success';

@Component({
  selector: 'app-checkout',
  template: `
    <div class="page route-enter">

      <!-- Breadcrumb -->
      <div class="crumb-row">
        <button class="crumb-back" [routerLink]="step === 'address' ? '/marketplace/cart' : null"
                (click)="step !== 'address' && backToAddress()">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <a routerLink="/marketplace/cart">Panier</a>
          <span>›</span>
          <span>Checkout</span>
        </div>
        <div>
          <div class="eyebrow" style="margin-bottom:10px">Paiement</div>
          <h1 class="display" style="font-size:clamp(32px,5vw,64px);margin:0">Finaliser la commande</h1>
        </div>
      </div>

      <!-- Step indicator -->
      <div class="co-steps" *ngIf="step !== 'success'">
        <div class="co-step" [class.active]="step === 'address'" [class.done]="step === 'payment'">
          <div class="co-step-dot">{{ step === 'payment' ? '✓' : '1' }}</div>
          <span>Livraison</span>
        </div>
        <div class="co-step-line"></div>
        <div class="co-step" [class.active]="step === 'payment'">
          <div class="co-step-dot">2</div>
          <span>Paiement</span>
        </div>
      </div>

      <div class="full" style="padding-top:24px">
        <div class="row g-4">
          <div class="col-lg-8">

            <!-- ── STEP 1 : Address ── -->
            <section *ngIf="step === 'address'" class="card-cp p-4" [cpReveal]="0">
              <h3 class="display" style="font-size:1.2rem;margin-bottom:1rem">
                <i class="bi bi-geo-alt me-2"></i>Adresse de livraison
              </h3>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Nom complet</label>
                    <input class="cp-field-input" [(ngModel)]="addr.fullName" placeholder="Ex: Ahmed Ben Ali">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Téléphone</label>
                    <input class="cp-field-input" [(ngModel)]="addr.phone" placeholder="+216 XX XXX XXX">
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
                    <input class="cp-field-input" [(ngModel)]="addr.city" placeholder="Tunis">
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="cp-field">
                    <label class="cp-field-label">Code postal</label>
                    <input class="cp-field-input" [(ngModel)]="addr.postalCode" placeholder="1000">
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="cp-field">
                    <label class="cp-field-label">Pays</label>
                    <input class="cp-field-input" [(ngModel)]="addr.country" placeholder="TN">
                  </div>
                </div>
              </div>

              <div *ngIf="addrError" class="co-error mt-3">
                <i class="bi bi-exclamation-circle me-1"></i>{{ addrError }}
              </div>

              <div class="d-flex gap-2 mt-4">
                <button class="btn-cp btn-ghost-cp" routerLink="/marketplace/cart">
                  <i class="bi bi-arrow-left"></i> Retour panier
                </button>
                <button class="btn-cp btn-primary-cp" (click)="placeOrder()" [disabled]="loading"
                        style="padding:.75rem 1.5rem">
                  <span *ngIf="!loading"><i class="bi bi-lock-fill me-2"></i>Continuer vers le paiement</span>
                  <span *ngIf="loading" class="co-spinner-inline"></span>
                </button>
              </div>
            </section>

            <!-- ── STEP 2 : Payment form (Stripe Elements style) ── -->
            <section *ngIf="step === 'payment'" class="card-cp p-4" [cpReveal]="0">
              <h3 class="display" style="font-size:1.2rem;margin-bottom:1.25rem">
                <i class="bi bi-credit-card me-2"></i>Informations de paiement
              </h3>

              <!-- Stripe-style card frame -->
              <div class="stripe-frame">
                <div class="stripe-logo-row">
                  <div class="stripe-badge">
                    <i class="bi bi-shield-lock-fill"></i>
                    Sécurisé par <strong>Stripe</strong>
                  </div>
                  <div class="card-brand-icons">
                    <span class="card-brand visa">VISA</span>
                    <span class="card-brand mc">MC</span>
                    <span class="card-brand amex">AMEX</span>
                  </div>
                </div>

                <div class="stripe-field-group">
                  <label class="stripe-label">Numéro de carte</label>
                  <div class="stripe-input-wrap">
                    <i class="bi bi-credit-card stripe-icon"></i>
                    <input
                      class="stripe-input"
                      [(ngModel)]="card.number"
                      (input)="formatCardNumber($event)"
                      maxlength="19"
                      placeholder="1234 5678 9012 3456"
                      autocomplete="cc-number"
                    >
                  </div>
                </div>

                <div class="stripe-row">
                  <div class="stripe-field-group">
                    <label class="stripe-label">Date d'expiration</label>
                    <div class="stripe-input-wrap">
                      <i class="bi bi-calendar3 stripe-icon"></i>
                      <input
                        class="stripe-input"
                        [(ngModel)]="card.expiry"
                        (input)="formatExpiry($event)"
                        maxlength="5"
                        placeholder="MM/AA"
                        autocomplete="cc-exp"
                      >
                    </div>
                  </div>
                  <div class="stripe-field-group">
                    <label class="stripe-label">CVV</label>
                    <div class="stripe-input-wrap">
                      <i class="bi bi-lock stripe-icon"></i>
                      <input
                        class="stripe-input"
                        [(ngModel)]="card.cvv"
                        maxlength="4"
                        placeholder="123"
                        type="password"
                        autocomplete="cc-csc"
                      >
                    </div>
                  </div>
                </div>

                <div class="stripe-field-group">
                  <label class="stripe-label">Nom sur la carte</label>
                  <div class="stripe-input-wrap">
                    <i class="bi bi-person stripe-icon"></i>
                    <input
                      class="stripe-input"
                      [(ngModel)]="card.name"
                      placeholder="AHMED BEN ALI"
                      autocomplete="cc-name"
                      style="text-transform:uppercase"
                    >
                  </div>
                </div>
              </div>

              <div *ngIf="payError" class="co-error mt-3">
                <i class="bi bi-exclamation-circle me-1"></i>{{ payError }}
              </div>

              <div class="d-flex gap-2 mt-4 align-items-center">
                <button class="btn-cp btn-ghost-cp" (click)="backToAddress()">
                  <i class="bi bi-arrow-left"></i> Modifier la livraison
                </button>
                <button class="btn-cp btn-primary-cp co-pay-btn"
                        (click)="confirmPayment()" [disabled]="paying">
                  <span *ngIf="!paying">
                    <i class="bi bi-lock-fill me-2"></i>Payer — {{ cartTotal | number:'1.2-2' }} DT
                  </span>
                  <span *ngIf="paying" class="d-flex align-items-center gap-2">
                    <span class="co-spinner-inline"></span>Traitement en cours…
                  </span>
                </button>
              </div>

              <div class="co-secure-note mt-3">
                <i class="bi bi-shield-check me-1"></i>
                Vos données bancaires sont chiffrées et ne sont jamais stockées sur nos serveurs.
              </div>
            </section>

            <!-- ── STEP 3 : Success ── -->
            <div *ngIf="step === 'success'" class="co-success-card" [cpReveal]="0">
              <div class="co-success-icon">✅</div>
              <h2>Paiement confirmé !</h2>
              <p>Votre commande a été passée avec succès. Vous recevrez une confirmation par email.</p>
              <div class="co-success-ref">
                Référence : <strong>{{ orderRef }}</strong>
              </div>
              <div class="d-flex gap-3 mt-4 justify-content-center flex-wrap">
                <button class="btn-cp btn-primary-cp" routerLink="/marketplace/orders">
                  <i class="bi bi-bag-check me-2"></i>Voir mes commandes
                </button>
                <button class="btn-cp btn-ghost-cp" routerLink="/marketplace">
                  <i class="bi bi-shop me-2"></i>Continuer les achats
                </button>
              </div>
            </div>

          </div>

          <!-- ── Right panel : Order summary ── -->
          <div class="col-lg-4" *ngIf="step !== 'success'">
            <div class="card-cp p-4" style="position:sticky;top:1rem" [cpReveal]="80">

              <div class="eyebrow" style="margin-bottom:1rem">Résumé de la commande</div>

              <div class="co-summary-items">
                <div *ngFor="let item of cartItems" class="co-summary-item">
                  <span class="co-item-name">{{ item.equipment?.name || 'Article' }}</span>
                  <span class="co-item-qty">×{{ item.quantity }}</span>
                  <span class="co-item-price">{{ (item.equipment?.price ?? 0) * item.quantity | number:'1.2-2' }} DT</span>
                </div>
              </div>

              <div style="border-top:1px solid var(--line);margin:1rem 0"></div>

              <div class="co-total-row">
                <span>Total</span>
                <strong style="font-size:1.15rem;color:var(--primary)">{{ cartTotal | number:'1.2-2' }} DT</strong>
              </div>

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
  styles: [`
    /* Steps */
    .co-steps {
      display: flex;
      align-items: center;
      gap: 0;
      margin: 24px 0 8px;
    }
    .co-step {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: .88rem;
      color: var(--muted);
      font-weight: 500;
    }
    .co-step.active { color: var(--ink); font-weight: 700; }
    .co-step.done   { color: var(--success); }
    .co-step-dot {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: var(--line);
      display: flex; align-items: center; justify-content: center;
      font-size: .78rem; font-weight: 700;
      transition: background .2s, color .2s;
    }
    .co-step.active .co-step-dot {
      background: var(--primary);
      color: #fff;
    }
    .co-step.done .co-step-dot {
      background: var(--success);
      color: #fff;
    }
    .co-step-line {
      flex: 0 0 40px;
      height: 2px;
      background: var(--line);
      margin: 0 8px;
    }

    /* Stripe frame */
    .stripe-frame {
      background: #f9fafb;
      border: 1.5px solid #e5e7eb;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .stripe-logo-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .stripe-badge {
      font-size: .8rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .card-brand-icons { display: flex; gap: 6px; }
    .card-brand {
      font-size: .65rem;
      font-weight: 800;
      letter-spacing: .5px;
      border-radius: 4px;
      padding: 3px 6px;
    }
    .card-brand.visa  { background: #1a1f71; color: #fff; }
    .card-brand.mc    { background: #eb001b; color: #fff; }
    .card-brand.amex  { background: #007bc1; color: #fff; }

    .stripe-field-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .stripe-row { display: flex; gap: 16px; }
    .stripe-label { font-size: .8rem; font-weight: 600; color: #374151; }
    .stripe-input-wrap {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1.5px solid #d1d5db;
      border-radius: 10px;
      padding: 0 12px;
      transition: border-color .15s, box-shadow .15s;
    }
    .stripe-input-wrap:focus-within {
      border-color: #635bff;
      box-shadow: 0 0 0 3px rgba(99,91,255,.12);
    }
    .stripe-icon { color: #9ca3af; font-size: 1rem; flex-shrink: 0; margin-right: 8px; }
    .stripe-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 11px 0;
      font-size: .93rem;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      color: #111827;
      background: transparent;
      letter-spacing: .5px;
    }
    .stripe-input::placeholder { color: #c1c5cb; }

    /* Error */
    .co-error {
      background: #fef2f2;
      color: #dc2626;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: .88rem;
      font-weight: 500;
    }

    /* Pay button */
    .co-pay-btn { padding: .75rem 1.5rem; font-size: 1rem; }

    /* Inline spinner */
    .co-spinner-inline {
      display: inline-block;
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Secure note */
    .co-secure-note {
      font-size: .78rem;
      color: var(--muted);
      display: flex;
      align-items: center;
    }

    /* Summary */
    .co-summary-items { display: flex; flex-direction: column; gap: 8px; }
    .co-summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: .88rem;
    }
    .co-item-name { flex: 1; color: var(--ink); }
    .co-item-qty  { color: var(--muted); font-size: .8rem; white-space: nowrap; }
    .co-item-price { font-weight: 600; white-space: nowrap; }
    .co-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: .95rem;
    }

    /* Success card */
    .co-success-card {
      text-align: center;
      background: #fff;
      border-radius: 20px;
      padding: 56px 40px;
      box-shadow: 0 2px 24px rgba(14,26,43,.08);
    }
    .co-success-icon { font-size: 4rem; margin-bottom: 16px; }
    .co-success-card h2 {
      font-size: 1.75rem; font-weight: 800; color: #0E1A2B; margin-bottom: 10px;
    }
    .co-success-card p {
      color: #6b7280; font-size: .95rem; max-width: 400px; margin: 0 auto 16px;
    }
    .co-success-ref {
      display: inline-block;
      background: #f0fdf4;
      color: #16a34a;
      border-radius: 8px;
      padding: 6px 16px;
      font-size: .88rem;
    }
  `]
})
export class CheckoutComponent {
  step: CheckoutStep = 'address';

  addr: ShippingAddress = { fullName: '', phone: '', line1: '', city: '', postalCode: '', country: 'TN' };
  card = { number: '', expiry: '', cvv: '', name: '' };

  loading  = false;  // creating order
  paying   = false;  // confirming payment
  addrError = '';
  payError  = '';

  cartTotal = 0;
  cartItems: any[] = [];
  orderRef  = '';

  private clientSecret = '';

  constructor(private mp: MarketplaceService) {
    // Pre-load cart total for the right panel
    this.mp.getCart().subscribe({
      next: (cart: any) => {
        this.cartItems = cart?.items ?? [];
        this.cartTotal = this.cartItems.reduce(
          (s: number, i: any) => s + (i.equipment?.price ?? 0) * (i.quantity ?? 1), 0
        );
      },
      error: () => {}
    });
  }

  // ── Step 1 : create order + intent ──────────────────────
  placeOrder(): void {
    if (!this.addr.fullName.trim()) { this.addrError = 'Le nom complet est requis.'; return; }
    if (!this.addr.line1.trim())    { this.addrError = 'L\'adresse est requise.'; return; }
    if (!this.addr.city.trim())     { this.addrError = 'La ville est requise.'; return; }
    this.addrError = '';
    this.loading = true;

    this.mp.createOrder(this.addr).subscribe({
      next: (order: any) => {
        this.mp.createPaymentIntent(order.orderId).subscribe({
          next: (p: any) => {
            this.clientSecret = p.clientSecret ?? '';
            this.orderRef     = order.orderId ?? ('CMD-' + Date.now());
            this.loading      = false;
            this.step         = 'payment';
          },
          error: () => { this.loading = false; this.addrError = 'Erreur lors de la création du paiement.'; }
        });
      },
      error: () => { this.loading = false; this.addrError = 'Erreur lors de la création de la commande.'; }
    });
  }

  backToAddress(): void { this.step = 'address'; }

  // ── Step 2 : confirm payment ─────────────────────────────
  confirmPayment(): void {
    if (!this.card.number.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      this.payError = 'Numéro de carte invalide.'; return;
    }
    if (!this.card.expiry.match(/^\d{2}\/\d{2}$/)) {
      this.payError = 'Date d\'expiration invalide (MM/AA).'; return;
    }
    if (!this.card.cvv.match(/^\d{3,4}$/)) {
      this.payError = 'CVV invalide.'; return;
    }
    this.payError = '';
    this.paying   = true;

    // Simulate Stripe confirmCardPayment with the clientSecret
    setTimeout(() => {
      this.paying = false;
      this.mp.clearCart().subscribe({ error: () => {} });
      this.step = 'success';
    }, 1800);
  }

  // ── Card input formatters ────────────────────────────────
  formatCardNumber(event: any): void {
    let v = event.target.value.replace(/\D/g, '').substring(0, 16);
    v = v.replace(/(.{4})/g, '$1 ').trim();
    this.card.number    = v;
    event.target.value  = v;
  }

  formatExpiry(event: any): void {
    let v = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
    this.card.expiry   = v;
    event.target.value = v;
  }
}
