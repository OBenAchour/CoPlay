import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing } from '../../Models/Marketplace/Listing';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private baseUrl = '/api/listings';

  constructor(private http: HttpClient) {}

  getListings(filters?: { type?: string; category?: string; keyword?: string }): Observable<Listing[]> {
    const params = filters ? this.buildQueryParams(filters) : {};
    return this.http.get<Listing[]>(this.baseUrl, { params });
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.baseUrl}/${id}`);
  }

  createListing(data: Partial<Listing>): Observable<Listing> {
    return this.http.post<Listing>(this.baseUrl, data);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.baseUrl}/my`);
  }

  reserveListing(id: string): Observable<Listing> {
    return this.http.post<Listing>(`${this.baseUrl}/${id}/reserve`, {});
  }

  closeListing(id: string): Observable<Listing> {
    return this.http.post<Listing>(`${this.baseUrl}/${id}/close`, {});
  }

  rateListing(id: string, rating: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/rate`, { rating });
  }

  private buildQueryParams(filters: { type?: string; category?: string; keyword?: string }): any {
    const params: any = {};
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.keyword) params.keyword = filters.keyword;
    return params;
  }
}
