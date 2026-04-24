import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../../Models/Auth/User';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  // Envoie les données d'inscription au serveur pour créer un nouveau compte utilisateur
  register(registerData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, registerData);
  }

  // Authentifie l'utilisateur et stocke le token JWT ainsi que les infos de base dans le stockage local
  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_email', response.email);
          localStorage.setItem('user_name', response.displayName);
          localStorage.setItem('user_role', response.role);
        }
      })
    );
  }

  // Déconnecte l'utilisateur en vidant l'intégralité du stockage local (localStorage)
  logout() {
    localStorage.clear();
  }

  // Vérifie si un utilisateur est connecté en validant la présence et l'expiration du token JWT
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !this.jwtHelper.isTokenExpired(token);
  }

  // Récupère le nom de l'utilisateur en décodant la charge utile (payload) du token JWT
  getUserName(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || 'Utilisateur';
  }

  // Récupère l'adresse email de l'utilisateur stockée localement lors de la connexion
  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  // Extrait le rôle de l'utilisateur depuis le token JWT ou le stockage local en dernier recours
  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.role || localStorage.getItem('user_role');
    }
    return localStorage.getItem('user_role');
  }

  // Récupère l'identifiant unique de l'utilisateur à partir du payload du token
  getUserId(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || '';
    } catch (e) {
      return '';
    }
  }

  // Renvoie la date d'expiration du token sous forme de timestamp (millisecondes)
  getTokenExpiration(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      return expirationDate ? expirationDate.getTime() : null;
    }
    return null;
  }

  // Vérifie rapidement si l'utilisateur possède les privilèges d'administrateur via le token
  isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'ADMIN';
    } catch (e) {
      return false;
    }
  }

  // Envoie une demande de réinitialisation de mot de passe pour l'adresse email fournie
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // Récupère les informations complètes du profil de l'utilisateur actuellement authentifié
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  // Permet à l'utilisateur de modifier son mot de passe actuel via une requête PUT sécurisée
  changePassword(data: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/users/me/password`, data);
  }
}