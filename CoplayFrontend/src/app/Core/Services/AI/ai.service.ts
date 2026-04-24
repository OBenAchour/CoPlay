import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getSuggestion(prefix: string, context: string): Observable<{ suggestion: string }> {
    return this.http.post<{ suggestion: string }>(`${this.apiUrl}/ai/complete`, {
      prefix: prefix,
      context: context
    });
  }

  getMultipleSuggestions(prefix: string, context: string, count: number = 3): Observable<{ suggestions: string[] }> {
    return this.http.post<{ suggestions: string[] }>(`${this.apiUrl}/ai/complete/multiple`, {
      prefix: prefix,
      context: context,
      count: count
    });
  }
}