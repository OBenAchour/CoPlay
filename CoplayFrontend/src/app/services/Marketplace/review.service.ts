import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReviewTargetType = 'EQUIPMENT' | 'SERVICE' | 'COACH';

export interface Review {
  reviewId?: string;
  authorId: string;
  targetId: string;
  targetType: ReviewTargetType;
  rating: number;
  comment?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {

  private apiUrl = 'http://localhost:8080/api/reviews';

  constructor(private http: HttpClient) { }

  create(r: Review): Observable<Review> {
    let params = new HttpParams()
      .set('authorId', r.authorId)
      .set('targetId', r.targetId)
      .set('targetType', r.targetType)
      .set('rating', String(r.rating));
    if (r.comment) params = params.set('comment', r.comment);
    return this.http.post<Review>(this.apiUrl, null, { params });
  }

  list(targetId: string, targetType: ReviewTargetType): Observable<Review[]> {
    const params = new HttpParams().set('targetId', targetId).set('targetType', targetType);
    return this.http.get<Review[]>(this.apiUrl, { params });
  }

  average(targetId: string, targetType: ReviewTargetType): Observable<number> {
    const params = new HttpParams().set('targetId', targetId).set('targetType', targetType);
    return this.http.get<number>(`${this.apiUrl}/average`, { params });
  }

  coachAverage(coachId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/coach/${coachId}/average`);
  }
}
