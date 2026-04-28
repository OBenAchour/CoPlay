import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriqueAction } from 'src/app/Core/Models/Teams/HistoriqueAction';

@Injectable({ providedIn: 'root' })
export class HistoriqueActionService {

  private apiUrl = 'http://localhost:8081/api/teams';

  constructor(private http: HttpClient) {}

  getActions(teamId: string): Observable<HistoriqueAction[]> {
    return this.http.get<HistoriqueAction[]>(`${this.apiUrl}/${teamId}/actions`);
  }

  addAction(teamId: string, action: HistoriqueAction): Observable<HistoriqueAction> {
    return this.http.post<HistoriqueAction>(`${this.apiUrl}/${teamId}/actions`, action);
  }

  clearActions(teamId: string, captainId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/actions/clear`, { params: { captainId } });
  }
}
