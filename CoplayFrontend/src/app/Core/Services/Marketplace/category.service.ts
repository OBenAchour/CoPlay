import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../Models/Marketplace/Category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les catégories actives
   */
  getActiveCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  /**
   * Récupère une catégorie par son nom
   */
  getCategoryByName(name: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${name}`);
  }
}
