import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MarketplaceService {
  serviceId?: string;
  providerId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

@Injectable({ providedIn: 'root' })
export class MarketplaceServiceApi {

  private apiUrl = 'http://localhost:8080/api/marketplace-services';

  constructor(private http: HttpClient) { }

  create(s: MarketplaceService): Observable<MarketplaceService> {
    let params = new HttpParams()
      .set('providerId', s.providerId)
      .set('name', s.name)
      .set('price', String(s.price))
      .set('category', s.category);
    if (s.description) params = params.set('description', s.description);
    return this.http.post<MarketplaceService>(this.apiUrl, null, { params });
  }

  publish(serviceId: string): Observable<MarketplaceService> {
    return this.http.patch<MarketplaceService>(`${this.apiUrl}/${serviceId}/publish`, null);
  }

  archive(serviceId: string): Observable<MarketplaceService> {
    return this.http.patch<MarketplaceService>(`${this.apiUrl}/${serviceId}/archive`, null);
  }

  get(serviceId: string): Observable<MarketplaceService> {
    return this.http.get<MarketplaceService>(`${this.apiUrl}/${serviceId}`);
  }

  list(filters: { providerId?: string; category?: string } = {}): Observable<MarketplaceService[]> {
    let params = new HttpParams();
    if (filters.providerId) params = params.set('providerId', filters.providerId);
    if (filters.category) params = params.set('category', filters.category);
    return this.http.get<MarketplaceService[]>(this.apiUrl, { params });
  }
}
