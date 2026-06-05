import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MessageEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private base = 'http://localhost:8080/api/teams';

  constructor(private http: HttpClient) {}

  chat(teamId: string, userId: string, message: string): Observable<any> {
    return this.http.post<any>(
      `${this.base}/${teamId}/onboarding/chat?userId=${userId}`,
      { message }
    );
  }

  getHistory(teamId: string, userId: string): Observable<MessageEntry[]> {
    return this.http.get<MessageEntry[]>(
      `${this.base}/${teamId}/onboarding/history?userId=${userId}`
    );
  }

  clearHistory(teamId: string, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${teamId}/onboarding/history?userId=${userId}`
    );
  }
}
