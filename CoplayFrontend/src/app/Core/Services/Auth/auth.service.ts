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
          // Store userId explicitly so components can use it without JWT decoding
          if (response.userId) {
            localStorage.setItem('userId', response.userId);
          }
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

  // Récupère le nom de l'utilisateur (localStorage en priorité, puis JWT)
  getUserName(): string {
    const stored = localStorage.getItem('user_name');
    if (stored) return stored;
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const p = JSON.parse(atob(token.split('.')[1]));
      return p.name || p.displayName || p.sub || 'Utilisateur';
    } catch (_) { return 'Utilisateur'; }
  }

  // Récupère l'adresse email de l'utilisateur stockée localement lors de la connexion
  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  // Extrait le rôle : localStorage en priorité (mis à jour par saveProfile),
  // puis JWT comme fallback (rôle au moment du login)
  getUserRole(): string | null {
    const stored = localStorage.getItem('user_role');
    if (stored) return stored;
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = this.jwtHelper.decodeToken(token);
        return decoded.role || null;
      } catch (_) {}
    }
    return null;
  }

  // Récupère l'identifiant unique de l'utilisateur (MongoDB ObjectId, jamais l'email)
  getUserId(): string {
    // 1. Source la plus fiable : stocké explicitement au login si le backend le renvoie
    const stored = localStorage.getItem('userId');
    if (stored && !stored.includes('@')) return stored;

    // 2. Décoder le JWT — chercher un claim userId ou id avant sub
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Prefer explicit userId/id claim over sub (sub is often the email in Spring Boot)
      const id = payload.userId || payload.id || payload.user_id;
      if (id && !String(id).includes('@')) return String(id);
      // sub fallback only if it looks like a MongoDB ObjectId (24 hex chars) not an email
      const sub = payload.sub || '';
      if (sub && !sub.includes('@')) return sub;
    } catch (_) {}
    return '';
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

  // Vérifie si l'utilisateur est admin (localStorage prioritaire sur JWT)
  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
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