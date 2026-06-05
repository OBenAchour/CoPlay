import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, profileData);
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/auth/change-password`, data);
  }

  // ← AJOUTÉ : Cherche des utilisateurs par nom ou email
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { q: query },
      headers: this.getHeaders()
    });
  }
}
