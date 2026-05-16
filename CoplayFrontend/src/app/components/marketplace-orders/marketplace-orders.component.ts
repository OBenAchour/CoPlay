import { Component, OnInit } from '@angular/core';
import { OrderService, Order } from '../../services/Marketplace/order.service';

@Component({
  selector: 'app-marketplace-orders',
  templateUrl: './marketplace-orders.component.html',
  styleUrls: ['./marketplace-orders.component.css']
})
export class MarketplaceOrdersComponent implements OnInit {

  userId = localStorage.getItem('userId') || '';
  orders: Order[] = [];
  loading = false;
  filterStatus = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { if (this.userId) this.load(); }

  load() {
    this.loading = true;
    this.orderService.byBuyer(this.userId).subscribe({
      next: o => { this.orders = o; this.loading = false; },
      error: e => { console.error(e); this.loading = false; }
    });
  }

  filtered() {
    return this.filterStatus ? this.orders.filter(o => o.status === this.filterStatus) : this.orders;
  }

  pay(id: string) {
    this.orderService.pay(id).subscribe({ next: () => this.load() });
  }

  cancel(id: string) {
    if (!confirm('Annuler cette commande ?')) return;
    this.orderService.cancel(id).subscribe({ next: () => this.load() });
  }

  complete(id: string) {
    this.orderService.complete(id).subscribe({ next: () => this.load() });
  }

  total() {
    return this.filtered().reduce((sum, o) => sum + (o.amount || 0), 0);
  }
}
