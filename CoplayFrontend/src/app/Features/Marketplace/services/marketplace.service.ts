import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../../../Core/Models/Marketplace/Equipment';
import { MarketplaceService as ServiceModel } from '../../../Core/Models/Marketplace/MarketplaceService';
import { Review } from '../../../Core/Models/Marketplace/Review';
import { Cart } from '../../../Core/Models/Marketplace/Cart';
import { Order, ShippingAddress } from '../../../Core/Models/Marketplace/Order';
import { Booking } from '../../../Core/Models/Marketplace/Booking';

const BASE = 'http://localhost:8080/api/marketplace';

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  constructor(private http: HttpClient) {}

  // Equipment
  listEquipment(page = 0, size = 20): Observable<any> {
    return this.http.get(`${BASE}/equipment`, { params: { page, size } as any });
  }
  getEquipment(id: string): Observable<Equipment> { return this.http.get<Equipment>(`${BASE}/equipment/${id}`); }
  myEquipment(): Observable<Equipment[]> { return this.http.get<Equipment[]>(`${BASE}/equipment/me`); }
  createEquipment(e: Partial<Equipment>): Observable<Equipment> { return this.http.post<Equipment>(`${BASE}/equipment`, e); }
  updateEquipment(id: string, e: Partial<Equipment>): Observable<Equipment> { return this.http.put<Equipment>(`${BASE}/equipment/${id}`, e); }
  deleteEquipment(id: string): Observable<void> { return this.http.delete<void>(`${BASE}/equipment/${id}`); }
  uploadEquipmentImage(id: string, file: File): Observable<Equipment> {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<Equipment>(`${BASE}/equipment/${id}/images`, fd);
  }
  searchEquipments(filter: any): Observable<Equipment[]> {
    let params = new HttpParams();
    Object.keys(filter || {}).forEach(k => { if (filter[k] != null && filter[k] !== '') params = params.set(k, filter[k]); });
    return this.http.get<Equipment[]>(`${BASE}/equipment/search`, { params });
  }

  // Services
  listServices(page = 0, size = 20): Observable<any> {
    return this.http.get(`${BASE}/services`, { params: { page, size } as any });
  }
  getService(id: string): Observable<ServiceModel> { return this.http.get<ServiceModel>(`${BASE}/services/${id}`); }
  myServices(): Observable<ServiceModel[]> { return this.http.get<ServiceModel[]>(`${BASE}/services/me`); }
  createService(s: Partial<ServiceModel>): Observable<ServiceModel> { return this.http.post<ServiceModel>(`${BASE}/services`, s); }
  searchServices(filter: any): Observable<ServiceModel[]> {
    let params = new HttpParams();
    Object.keys(filter || {}).forEach(k => { if (filter[k] != null && filter[k] !== '') params = params.set(k, filter[k]); });
    return this.http.get<ServiceModel[]>(`${BASE}/services/search`, { params });
  }
  nearbyServices(lat: number, lng: number, radius = 10, sport?: string): Observable<ServiceModel[]> {
    let params = new HttpParams().set('lat', lat).set('lng', lng).set('radius', radius);
    if (sport) params = params.set('sport', sport);
    return this.http.get<ServiceModel[]>(`${BASE}/services/search/nearby`, { params });
  }

  // Reviews
  listReviews(targetId: string, targetType: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${BASE}/reviews`, { params: { targetId, targetType } as any });
  }
  createReview(r: Partial<Review>): Observable<Review> { return this.http.post<Review>(`${BASE}/reviews`, r); }
  helpful(reviewId: string): Observable<Review> { return this.http.post<Review>(`${BASE}/reviews/${reviewId}/helpful`, {}); }

  // Cart
  getCart(): Observable<Cart> { return this.http.get<Cart>(`${BASE}/cart`); }
  addToCart(targetId: string, targetType: string, quantity = 1): Observable<Cart> {
    return this.http.post<Cart>(`${BASE}/cart/items`, { targetId, targetType, quantity });
  }
  updateQuantity(targetId: string, quantity: number): Observable<Cart> {
    return this.http.patch<Cart>(`${BASE}/cart/items/${targetId}`, null, { params: { quantity } as any });
  }
  removeFromCart(targetId: string): Observable<Cart> { return this.http.delete<Cart>(`${BASE}/cart/items/${targetId}`); }
  clearCart(): Observable<Cart> { return this.http.delete<Cart>(`${BASE}/cart`); }

  // Orders
  createOrder(shippingAddress: ShippingAddress, paymentMethod = 'STRIPE'): Observable<Order> {
    return this.http.post<Order>(`${BASE}/orders`, { shippingAddress, paymentMethod });
  }
  myOrders(page = 0, size = 20): Observable<any> { return this.http.get(`${BASE}/orders/me`, { params: { page, size } as any }); }
  mySales(page = 0, size = 20): Observable<any> { return this.http.get(`${BASE}/orders/sales`, { params: { page, size } as any }); }
  getOrder(id: string): Observable<Order> { return this.http.get<Order>(`${BASE}/orders/${id}`); }
  cancelOrder(id: string): Observable<Order> { return this.http.post<Order>(`${BASE}/orders/${id}/cancel`, {}); }

  // Bookings
  createBooking(b: Partial<Booking>): Observable<Booking> { return this.http.post<Booking>(`${BASE}/bookings`, b); }
  myBookings(page = 0, size = 20): Observable<any> { return this.http.get(`${BASE}/bookings/me`, { params: { page, size } as any }); }
  asProviderBookings(page = 0, size = 20): Observable<any> { return this.http.get(`${BASE}/bookings/provider`, { params: { page, size } as any }); }
  bookingStatus(id: string, status: string): Observable<Booking> {
    return this.http.patch<Booking>(`${BASE}/bookings/${id}/status`, null, { params: { status } as any });
  }

  // Payment
  createPaymentIntent(orderId?: string, bookingId?: string): Observable<any> {
    return this.http.post(`${BASE}/payments/intent`, { orderId, bookingId });
  }

  // Favorites
  favorites(): Observable<any[]> { return this.http.get<any[]>(`${BASE}/favorites`); }
  toggleFavorite(targetId: string, targetType: string): Observable<{ favorite: boolean }> {
    return this.http.post<{ favorite: boolean }>(`${BASE}/favorites/toggle`, null, { params: { targetId, targetType } as any });
  }

  // Negotiation
  startNegotiation(targetId: string, targetType: string, proposedPrice?: number): Observable<any> {
    return this.http.post(`${BASE}/negotiations`, { targetId, targetType, proposedPrice });
  }

  // AI
  recommendations(limit = 10): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${BASE}/ai/recommendations`, { params: { limit } as any });
  }
  estimatePrice(equipmentId: string): Observable<{ estimatedPrice: number; currency: string }> {
    return this.http.post<any>(`${BASE}/ai/estimate-price/${equipmentId}`, {});
  }
  matchProviders(sport: string, need = '', limit = 5): Observable<ServiceModel[]> {
    return this.http.get<ServiceModel[]>(`${BASE}/ai/match-providers`, { params: { sport, need, limit } as any });
  }
  detectFraud(equipmentId: string): Observable<any> { return this.http.post(`${BASE}/ai/detect-fraud/${equipmentId}`, {}); }
  chat(message: string): Observable<{ reply: string }> { return this.http.post<{ reply: string }>(`${BASE}/ai/chat`, { message }); }
}
