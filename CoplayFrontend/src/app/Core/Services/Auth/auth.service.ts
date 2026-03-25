import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../../Models/Auth/User';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // L'URL de ton backend IntelliJ
  private apiUrl = 'http://localhost:8080/api/auth';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  // --- ACTIONS ---

  // Inscription
  register(registerData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, registerData);
  }

  // Connexion
  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData).pipe(
      tap(response => {
        if (response.token) {
          // Stockage des informations brutes
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_email', response.email);
          localStorage.setItem('user_name', response.displayName);
          localStorage.setItem('user_role', response.role);
        }
      })
    );
  }

  // Déconnexion
  logout() {
    localStorage.clear();
  }

  // --- GETTERS & VÉRIFICATIONS ---

  /**
   * Vérifie si l'utilisateur est connecté ET si le token n'est pas expiré
   * Utilise la bibliothèque angular-jwt pour plus de sécurité
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Vérifie si le token est encore valide (temps d'expiration non dépassé)
    return !this.jwtHelper.isTokenExpired(token);
  }

  // Récupérer le nom d'affichage
 // Dans auth.service.ts
getUserName(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.name || 'Utilisateur'; // 'name' est la clé qu'on a mis dans JwtUtils.java
}

  // Récupérer l'email
  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  /**
   * Récupérer le rôle
   * On peut le lire depuis le localStorage ou directement depuis le Token décodé
   */
  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionnel : on décode le token pour être sûr d'avoir le rôle réel du JWT
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.role || localStorage.getItem('user_role');
    }
    return localStorage.getItem('user_role');
  }

  /**
   * Utile pour vérifier combien de temps il reste avant l'expiration (en secondes)
   */
  getTokenExpiration(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      return expirationDate ? expirationDate.getTime() : null;
    }
    return null;
  }

  // Core/Services/Auth/auth.service.ts

isAdmin(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // On décode la partie centrale (payload) du JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // On vérifie si le champ 'role' est égal à 'ADMIN'
    // Note : Vérifie si dans ton JwtUtils.java tu as mis "role" ou "roles"
    return payload.role === 'ADMIN'; 
  } catch (e) {
    return false;
  }
}

}