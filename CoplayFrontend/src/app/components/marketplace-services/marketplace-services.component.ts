import { Component, OnInit } from '@angular/core';
import { MarketplaceServiceApi, MarketplaceService } from '../../services/Marketplace/marketplace-service.service';
import { OrderService } from '../../services/Marketplace/order.service';
import { ReviewService, Review } from '../../services/Marketplace/review.service';

@Component({
  selector: 'app-marketplace-services',
  templateUrl: './marketplace-services.component.html',
  styleUrls: ['./marketplace-services.component.css']
})
export class MarketplaceServicesComponent implements OnInit {

  userId = localStorage.getItem('userId') || '';

  services: MarketplaceService[] = [];
  filterCategory = '';
  loading = false;
  selected: MarketplaceService | null = null;
  selectedReviews: Review[] = [];
  selectedRating = 0;

  newReview = { rating: 5, comment: '' };

  newSvc: MarketplaceService = {
    providerId: this.userId,
    name: '',
    description: '',
    price: 0,
    category: 'COACHING_SESSION'
  };

  categories = ['COACHING_SESSION', 'PHYSIO', 'NUTRITION', 'MENTAL', 'OTHER'];

  constructor(
    private api: MarketplaceServiceApi,
    private orderService: OrderService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.api.list(this.filterCategory ? { category: this.filterCategory } : {}).subscribe({
      next: s => { this.services = s.filter(x => x.status === 'PUBLISHED' || x.providerId === this.userId); this.loading = false; },
      error: e => { console.error(e); this.loading = false; }
    });
  }

  open(s: MarketplaceService) {
    this.selected = s;
    this.reviewService.list(s.serviceId!, 'SERVICE').subscribe({
      next: r => this.selectedReviews = r
    });
    this.reviewService.average(s.serviceId!, 'SERVICE').subscribe({
      next: avg => this.selectedRating = avg
    });
  }

  close() { this.selected = null; }

  buy(s: MarketplaceService) {
    if (!this.userId) { alert('Connectez-vous'); return; }
    if (!confirm(`Acheter "${s.name}" pour ${s.price} € ?`)) return;
    this.orderService.create(this.userId, s.serviceId!, 'SERVICE').subscribe({
      next: o => {
        if (confirm('Commande créée. Payer maintenant ?\n(Une session de coaching sera automatiquement créée pour les COACHING_SESSION)')) {
          this.orderService.pay(o.orderId!).subscribe({
            next: () => alert('Paiement confirmé ✅')
          });
        }
      }
    });
  }

  postReview() {
    if (!this.selected || !this.userId) return;
    this.reviewService.create({
      authorId: this.userId,
      targetId: this.selected.serviceId!,
      targetType: 'SERVICE',
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: () => { this.newReview = { rating: 5, comment: '' }; this.open(this.selected!); }
    });
  }

  createService() {
    if (!this.newSvc.name || !this.newSvc.price) { alert('Nom et prix requis'); return; }
    this.newSvc.providerId = this.userId;
    this.api.create(this.newSvc).subscribe({
      next: () => {
        this.newSvc = { providerId: this.userId, name: '', description: '', price: 0, category: 'COACHING_SESSION' };
        this.load();
      }
    });
  }

  publish(id: string) { this.api.publish(id).subscribe({ next: () => this.load() }); }
  archive(id: string) { this.api.archive(id).subscribe({ next: () => this.load() }); }
}
