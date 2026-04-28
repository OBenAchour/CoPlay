import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from "../../Models/Auth/User";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer le token
  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Récupérer le profil de l'utilisateur connecté
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // Mettre à jour son propre profil
  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, profileData);
  }

  changePassword(data: any): Observable<any> {
  return this.http.put(`http://localhost:8080/api/auth/change-password`, data);
}

  // ← AJOUTE JUSTE CETTE MÉTHODE
  searchUsers(q: string): Observable<User[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

}
