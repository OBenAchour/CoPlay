import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  // Génère les en-têtes HTTP incluant le token JWT récupéré depuis le stockage local
  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Récupère la liste de tous les utilisateurs (nécessite l'envoi manuel des headers ici)
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Récupère les données de profil spécifiques à l'utilisateur actuellement connecté
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // Envoie les modifications de profil de l'utilisateur connecté au serveur
  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, profileData);
  }

  // Permet à l'utilisateur de modifier son mot de passe via l'API d'authentification
  changePassword(data: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/auth/change-password`, data);
  }
}