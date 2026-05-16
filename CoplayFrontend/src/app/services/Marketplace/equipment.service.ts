import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Equipment {
  equipmentId?: string;
  sellerId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  status?: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  stock?: number;
  images?: string[];
}

@Injectable({ providedIn: 'root' })
export class EquipmentService {

  private apiUrl = 'http://localhost:8080/api/equipments';

  constructor(private http: HttpClient) { }

  create(eq: Equipment): Observable<Equipment> {
    let params = new HttpParams()
      .set('sellerId', eq.sellerId)
      .set('name', eq.name)
      .set('price', String(eq.price))
      .set('category', eq.category);
    if (eq.description) params = params.set('description', eq.description);
    if (eq.stock != null) params = params.set('stock', String(eq.stock));
    return this.http.post<Equipment>(this.apiUrl, eq.images ?? [], { params });
  }

  update(equipmentId: string, patch: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${equipmentId}`, patch);
  }

  changeStatus(equipmentId: string, status: string): Observable<Equipment> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Equipment>(`${this.apiUrl}/${equipmentId}/status`, null, { params });
  }

  get(equipmentId: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${equipmentId}`);
  }

  list(filters: { sellerId?: string; category?: string } = {}): Observable<Equipment[]> {
    let params = new HttpParams();
    if (filters.sellerId) params = params.set('sellerId', filters.sellerId);
    if (filters.category) params = params.set('category', filters.category);
    return this.http.get<Equipment[]>(this.apiUrl, { params });
  }
}
