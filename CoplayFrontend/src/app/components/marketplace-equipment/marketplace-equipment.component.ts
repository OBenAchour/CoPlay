import { Component, OnInit } from '@angular/core';
import { EquipmentService, Equipment } from '../../services/Marketplace/equipment.service';
import { OrderService } from '../../services/Marketplace/order.service';
import { ReviewService, Review } from '../../services/Marketplace/review.service';

@Component({
  selector: 'app-marketplace-equipment',
  templateUrl: './marketplace-equipment.component.html',
  styleUrls: ['./marketplace-equipment.component.css']
})
export class MarketplaceEquipmentComponent implements OnInit {

  userId = localStorage.getItem('userId') || '';

  equipments: Equipment[] = [];
  filterCategory = '';
  loading = false;
  selected: Equipment | null = null;
  selectedReviews: Review[] = [];
  selectedRating = 0;

  newReview = { rating: 5, comment: '' };

  newEq: Equipment = {
    sellerId: this.userId,
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 1,
    images: []
  };
  newEqImagesRaw = '';

  constructor(
    private equipmentService: EquipmentService,
    private orderService: OrderService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll() {
    this.loading = true;
    this.equipmentService.list(this.filterCategory ? { category: this.filterCategory } : {}).subscribe({
      next: e => { this.equipments = e; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  open(eq: Equipment) {
    this.selected = eq;
    this.reviewService.list(eq.equipmentId!, 'EQUIPMENT').subscribe({
      next: r => this.selectedReviews = r
    });
    this.reviewService.average(eq.equipmentId!, 'EQUIPMENT').subscribe({
      next: avg => this.selectedRating = avg
    });
  }

  close() { this.selected = null; this.selectedReviews = []; }

  buy(eq: Equipment) {
    if (!this.userId) { alert('Connectez-vous'); return; }
    if (!confirm(`Acheter "${eq.name}" pour ${eq.price} € ?`)) return;
    this.orderService.create(this.userId, eq.equipmentId!, 'EQUIPMENT').subscribe({
      next: o => {
        if (confirm('Commande créée. Payer maintenant ?')) {
          this.orderService.pay(o.orderId!).subscribe({
            next: () => { alert('Paiement confirmé ✅'); this.loadAll(); }
          });
        }
      },
      error: e => alert('Erreur: ' + (e?.error?.message || e.message))
    });
  }

  postReview() {
    if (!this.selected || !this.userId) return;
    this.reviewService.create({
      authorId: this.userId,
      targetId: this.selected.equipmentId!,
      targetType: 'EQUIPMENT',
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: () => {
        this.newReview = { rating: 5, comment: '' };
        this.open(this.selected!);
      },
      error: e => alert('Erreur: ' + (e?.error?.message || e.message))
    });
  }

  createEquipment() {
    if (!this.newEq.name || !this.newEq.category || !this.newEq.price) {
      alert('Nom, catégorie, prix requis'); return;
    }
    this.newEq.sellerId = this.userId;
    this.newEq.images = this.newEqImagesRaw.split(',').map(s => s.trim()).filter(Boolean);
    this.equipmentService.create(this.newEq).subscribe({
      next: () => {
        this.newEq = { sellerId: this.userId, name: '', description: '', price: 0, category: '', stock: 1, images: [] };
        this.newEqImagesRaw = '';
        this.loadAll();
      },
      error: e => alert('Erreur: ' + (e?.error?.message || e.message))
    });
  }
}
