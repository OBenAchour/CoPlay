import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../services/marketplace.service';
import { Order } from '../../../Core/Models/Marketplace/Order';

@Component({
  selector: 'app-orders',
  template: `
    <div class="page route-enter">
      <div class="crumb-row">
        <button class="crumb-back" routerLink="/marketplace">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <span>Commandes</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">Historique</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">Mes commandes</h1>
            <p style="color:var(--muted);max-width:560px;margin:10px 0 0;font-size:15px">
              Suivez vos achats et leur statut en temps réel.
            </p>
          </div>
        </div>
      </div>

      <div class="full" style="padding-top:24px">
        <div class="cp-empty" *ngIf="orders.length === 0" [cpReveal]="0">
          <i class="bi bi-receipt"></i>
          <h4>Aucune commande</h4>
          <p>Vos achats apparaîtront ici.</p>
          <button class="btn-cp btn-primary-cp" routerLink="/marketplace">Explorer le catalogue</button>
        </div>

        <div class="card-cp overflow-hidden" *ngIf="orders.length > 0" [cpReveal]="0">
          <table class="cp-table">
            <thead><tr><th>Commande</th><th>Articles</th><th>Total</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let o of orders; let i = index" [cpReveal]="i * 40">
                <td><span class="mono" style="font-size:.8rem">{{ shortId(o.orderId) }}</span></td>
                <td>{{ o.items.length }} article(s)</td>
                <td><strong>{{ o.totalAmount }} €</strong></td>
                <td><span class="badge-cp" [ngClass]="badgeClass(o.status)">{{ statusLabel(o.status) }}</span></td>
                <td>
                  <button *ngIf="o.status === 'PENDING'" class="btn-cp btn-danger-cp btn-sm-cp" (click)="cancel(o)">
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  constructor(private mp: MarketplaceService) {}
  ngOnInit() { this.load(); }
  load() { this.mp.myOrders().subscribe(p => this.orders = p?.content || []); }
  cancel(o: Order) { if (confirm('Annuler la commande ?')) this.mp.cancelOrder(o.orderId!).subscribe(() => this.load()); }
  shortId(id?: string) { return id ? id.slice(-8).toUpperCase() : '—'; }
  statusLabel(s: string) {
    const m: any = { PENDING: 'En attente', PAID: 'Payée', SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée', REFUNDED: 'Remboursée' };
    return m[s] || s;
  }
  badgeClass(s: string) {
    return s === 'PAID' || s === 'DELIVERED' ? 'badge-cp-success'
         : s === 'SHIPPED' ? 'badge-cp-accent'
         : s === 'CANCELLED' || s === 'REFUNDED' ? 'badge-cp-danger'
         : 'badge-cp-warning';
  }
}
