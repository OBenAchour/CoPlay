import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../services/marketplace.service';
import { Equipment } from '../../../Core/Models/Marketplace/Equipment';

@Component({
  selector: 'app-my-listings',
  template: `
    <div class="page route-enter">
      <div class="crumb-row">
        <button class="crumb-back" routerLink="/marketplace">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <span>Mes annonces</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">Vendeur</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">Mes annonces</h1>
            <p style="color:var(--muted);max-width:560px;margin:10px 0 0;font-size:15px">
              Gérez votre catalogue d'équipements en vente ou location.
            </p>
          </div>
          <button class="btn-cp btn-primary-cp" routerLink="/marketplace/equipment/new">
            <i class="bi bi-plus-lg"></i> Nouvelle annonce
          </button>
        </div>
      </div>

      <div class="full" style="padding-top:24px">
        <div class="row g-3 mb-4">
          <div class="col-md-3"><div class="card-cp p-3" [cpReveal]="0"><div class="mono" style="font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Total</div><div class="display" style="font-size:1.8rem;margin-top:.25rem">{{ items.length }}</div></div></div>
          <div class="col-md-3"><div class="card-cp p-3" [cpReveal]="40"><div class="mono" style="font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Disponibles</div><div class="display" style="font-size:1.8rem;margin-top:.25rem">{{ count('AVAILABLE') }}</div></div></div>
          <div class="col-md-3"><div class="card-cp p-3" [cpReveal]="80"><div class="mono" style="font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Vendus</div><div class="display" style="font-size:1.8rem;margin-top:.25rem">{{ count('SOLD') }}</div></div></div>
          <div class="col-md-3"><div class="card-cp p-3" [cpReveal]="120"><div class="mono" style="font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Vues totales</div><div class="display" style="font-size:1.8rem;margin-top:.25rem">{{ totalViews() }}</div></div></div>
        </div>

        <div class="cp-empty" *ngIf="items.length === 0" [cpReveal]="0">
          <i class="bi bi-bag"></i>
          <h4>Aucune annonce</h4>
          <p>Créez votre première annonce pour commencer à vendre.</p>
          <button class="btn-cp btn-primary-cp" routerLink="/marketplace/equipment/new">Créer maintenant</button>
        </div>

        <div class="card-cp overflow-hidden" *ngIf="items.length > 0" [cpReveal]="60">
          <table class="cp-table">
            <thead>
              <tr><th>Annonce</th><th>Prix</th><th>Statut</th><th>Vues</th><th>Note</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of items">
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div style="width:50px;height:50px;border-radius:8px;background:var(--line-strong);overflow:hidden;flex-shrink:0">
                      <img *ngIf="e.images?.length" [src]="e.images?.[0]" style="width:100%;height:100%;object-fit:cover">
                    </div>
                    <div>
                      <div style="font-weight:600">{{ e.name }}</div>
                      <div style="font-size:.78rem;color:var(--muted)">{{ e.sport }} · {{ e.condition }}</div>
                    </div>
                  </div>
                </td>
                <td><strong>{{ e.price }} €</strong></td>
                <td><span class="badge-cp" [ngClass]="badgeClass(e.status)">{{ e.status }}</span></td>
                <td class="mono">{{ e.views }}</td>
                <td>
                  <span *ngIf="e.rating"><i class="bi bi-star-fill" style="color:var(--warning)"></i> {{ e.rating | number:'1.1-1' }}</span>
                  <span *ngIf="!e.rating" style="color:var(--muted)">—</span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="btn-cp btn-ghost-cp btn-sm-cp" [routerLink]="['/marketplace/equipment', e.equipmentId, 'edit']">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-cp btn-danger-cp btn-sm-cp" (click)="del(e)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class MyListingsComponent implements OnInit {
  items: Equipment[] = [];
  constructor(private mp: MarketplaceService, private router: Router) {}
  ngOnInit() { this.load(); }
  load() { this.mp.myEquipment().subscribe(r => this.items = r); }
  del(e: Equipment) {
    if (!confirm('Supprimer cette annonce ?')) return;
    this.mp.deleteEquipment(e.equipmentId!).subscribe(() => this.load());
  }
  count(s: string) { return this.items.filter(i => i.status === s).length; }
  totalViews() { return this.items.reduce((sum, i) => sum + (i.views || 0), 0); }
  badgeClass(s?: string) {
    return s === 'AVAILABLE' ? 'badge-cp-success' : s === 'SOLD' ? 'badge-cp-dark' : s === 'RESERVED' ? 'badge-cp-warning' : '';
  }
}
