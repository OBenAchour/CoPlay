import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketplaceService } from '../services/marketplace.service';
import { Equipment } from '../../../Core/Models/Marketplace/Equipment';

@Component({
  selector: 'app-equipment-form',
  template: `
    <div class="page route-enter">
      <div class="crumb-row">
        <button class="crumb-back" routerLink="/marketplace">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <span>Annonce</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">{{ editId ? 'Édition' : 'Nouveau' }}</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">{{ editId ? "Modifier l'annonce" : 'Vendre un équipement' }}</h1>
            <p style="color:var(--muted);max-width:560px;margin:10px 0 0;font-size:15px">
              {{ editId ? 'Mettez à jour les informations.' : 'Renseignez les détails de votre annonce.' }}
            </p>
          </div>
          <button class="btn-cp btn-primary-cp" (click)="save()">
            <i class="bi bi-check-lg"></i> {{ editId ? 'Mettre à jour' : 'Publier' }}
          </button>
        </div>
      </div>

      <div class="full" style="padding-top:24px">
        <div class="row g-4">
          <div class="col-lg-8">
            <section class="card-cp p-4 mb-4" [cpReveal]="0">
              <h3 class="display" style="font-size:1.2rem;margin-bottom:1rem">Informations</h3>
              <div class="row g-3">
                <div class="col-12">
                  <div class="cp-field">
                    <label class="cp-field-label">Nom de l'annonce</label>
                    <input class="cp-field-input" [(ngModel)]="form.name" placeholder="Ex: Raquette Wilson Pro Staff RF97">
                  </div>
                </div>
                <div class="col-12">
                  <div class="cp-field">
                    <label class="cp-field-label">Description</label>
                    <textarea class="cp-field-input" [(ngModel)]="form.description" placeholder="Décrivez l'état, l'historique, les particularités..." rows="4"></textarea>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Marque</label>
                    <input class="cp-field-input" [(ngModel)]="form.brand">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Sport</label>
                    <select class="cp-field-input" [(ngModel)]="form.sport">
                      <option value="">—</option>
                      <option>FOOTBALL</option><option>BASKETBALL</option><option>TENNIS</option>
                      <option>RUNNING</option><option>CYCLING</option><option>SWIMMING</option><option>FITNESS</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Catégorie</label>
                    <input class="cp-field-input" [(ngModel)]="form.category" placeholder="Raquette, ballon...">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Ville</label>
                    <input class="cp-field-input" [(ngModel)]="form.city">
                  </div>
                </div>
              </div>
            </section>

            <section class="card-cp p-4 mb-4" [cpReveal]="80">
              <h3 class="display" style="font-size:1.2rem;margin-bottom:1rem">Prix & disponibilité</h3>
              <div class="row g-3">
                <div class="col-md-4">
                  <div class="cp-field">
                    <label class="cp-field-label">État</label>
                    <select class="cp-field-input" [(ngModel)]="form.condition">
                      <option value="NEW">Neuf</option><option value="USED">Occasion</option><option value="REFURBISHED">Reconditionné</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="cp-field">
                    <label class="cp-field-label">Type</label>
                    <select class="cp-field-input" [(ngModel)]="form.listingType">
                      <option value="SALE">Vente</option><option value="RENT">Location</option><option value="BOTH">Vente & Location</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="cp-field">
                    <label class="cp-field-label">Quantité</label>
                    <input class="cp-field-input" type="number" [(ngModel)]="form.quantity">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="cp-field">
                    <label class="cp-field-label">Prix de vente (€)</label>
                    <input class="cp-field-input" type="number" [(ngModel)]="form.price">
                  </div>
                </div>
                <div class="col-md-6" *ngIf="form.listingType === 'RENT' || form.listingType === 'BOTH'">
                  <div class="cp-field">
                    <label class="cp-field-label">Location / jour (€)</label>
                    <input class="cp-field-input" type="number" [(ngModel)]="form.rentalPricePerDay">
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="col-lg-4">
            <section class="card-cp p-4 mb-4" *ngIf="editId" [cpReveal]="60">
              <h3 class="display" style="font-size:1.2rem;margin-bottom:1rem">Photos</h3>
              <label class="cp-empty" style="cursor:pointer;padding:2.5rem 1rem">
                <input type="file" (change)="upload($event)" accept="image/*" hidden>
                <i class="bi bi-cloud-arrow-up"></i>
                <p class="mb-0" style="font-size:.85rem">Cliquez pour uploader</p>
              </label>
              <div class="d-flex gap-2 flex-wrap mt-3">
                <img *ngFor="let img of form.images" [src]="img"
                     style="width:90px;height:90px;object-fit:cover;border-radius:var(--radius)">
              </div>
            </section>

            <section class="card-cp p-4" [cpReveal]="120">
              <h3 class="display" style="font-size:1.1rem;margin-bottom:1rem">Conseils</h3>
              <ul style="font-size:.85rem;color:var(--muted);padding-left:1.1rem;line-height:1.6">
                <li>Photos nettes, fond neutre, plusieurs angles</li>
                <li>Décrivez précisément l'état (rayures, usure)</li>
                <li>Comparez les prix avec d'autres annonces</li>
                <li>L'IA peut estimer un prix juste pour vous</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EquipmentFormComponent implements OnInit {
  form: Partial<Equipment> = { listingType: 'SALE', condition: 'NEW', images: [], quantity: 1 };
  editId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private mp: MarketplaceService) {}

  ngOnInit() {
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) this.mp.getEquipment(this.editId).subscribe(e => this.form = e);
  }

  save() {
    const op = this.editId
      ? this.mp.updateEquipment(this.editId, this.form)
      : this.mp.createEquipment(this.form);
    op.subscribe(saved => {
      this.editId = saved.equipmentId!;
      this.form = saved;
      this.router.navigate(['/marketplace/equipment', saved.equipmentId, 'edit']);
    });
  }

  upload(ev: any) {
    const file = ev.target.files[0];
    if (!file || !this.editId) return;
    this.mp.uploadEquipmentImage(this.editId, file).subscribe(e => this.form = e);
  }
}
