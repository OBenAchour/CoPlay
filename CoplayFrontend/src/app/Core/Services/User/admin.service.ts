// Core/Services/User/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Supprimez "/users" de la fin de l'URL de base
  private apiUrl = 'http://localhost:8080/api/admin'; 

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  resetUserPassword(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/reset-password`, {});
  }
}