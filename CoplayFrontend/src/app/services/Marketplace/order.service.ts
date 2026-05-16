import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type OrderTargetType = 'EQUIPMENT' | 'SERVICE';
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'COMPLETED';

export interface Order {
  orderId?: string;
  buyerId: string;
  targetId: string;
  targetType: OrderTargetType;
  amount?: number;
  status?: OrderStatus;
  createdAt?: string;
  paidAt?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) { }

  create(buyerId: string, targetId: string, targetType: OrderTargetType): Observable<Order> {
    const params = new HttpParams()
      .set('buyerId', buyerId)
      .set('targetId', targetId)
      .set('targetType', targetType);
    return this.http.post<Order>(this.apiUrl, null, { params });
  }

  pay(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/pay`, null);
  }

  cancel(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/cancel`, null);
  }

  complete(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/complete`, null);
  }

  get(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  byBuyer(buyerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/buyer/${buyerId}`);
  }
}
