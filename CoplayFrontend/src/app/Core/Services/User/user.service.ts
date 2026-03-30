import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

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


}