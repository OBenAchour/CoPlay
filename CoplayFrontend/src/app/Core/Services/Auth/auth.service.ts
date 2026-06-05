import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token && response.userId) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('email', response.email);
            localStorage.setItem('displayName', response.displayName);
            localStorage.setItem('role', response.role);
            this.currentUserSubject.next(response);
          }
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('displayName');
    localStorage.removeItem('role');
    this.currentUserSubject.next(null);
  }

  /**
   * Retourne l'ID MongoDB réel de l'utilisateur
   */
  getUserId(): string {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('⚠️ getUserId() : userId introuvable');
      return '';
    }
    return userId;
  }

  /**
   * Alias pour getUserId (utilisé par certains composants)
   */
  getCurrentUserId(): string {
    return this.getUserId();
  }

  /**
   * Retourne l'email de l'utilisateur
   */
  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  /**
   * Alias pour getEmail (pour compatibilité avec les anciens composants)
   */
  getUserEmail(): string {
    return this.getEmail();
  }

  /**
   * Retourne le nom d'affichage
   */
  getDisplayName(): string {
    return localStorage.getItem('displayName') || '';
  }

  /**
   * Alias pour getDisplayName (utilisé par certains composants)
   */
  getUserName(): string {
    return this.getDisplayName();
  }

  /**
   * Retourne le rôle de l'utilisateur
   */
  getRole(): string {
    return localStorage.getItem('role') || 'PLAYER';
  }

  /**
   * Alias pour getRole (utilisé par certains composants)
   */
  getUserRole(): string {
    return this.getRole();
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Alias pour isLoggedIn
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  /**
   * Retourne le token JWT
   */
  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  /**
   * Retourne les infos de l'utilisateur courant
   */
  getCurrentUser(): any {
    return {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('email'),
      displayName: localStorage.getItem('displayName'),
      role: localStorage.getItem('role')
    };
  }

  /**
   * Change le mot de passe de l'utilisateur
   */
  changePassword(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, data);
  }

  /**
   * Forgotten password
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Rechercher des utilisateurs
   */
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/users/search`, {
      params: { q: query }
    });
  }

  /**
   * Récupérer un utilisateur par ID
   */
  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8081/api/users/${userId}`);
  }

  /**
   * Incrémenter les étoiles d'un utilisateur (pour les récompenses)
   */
  incrementStars(userId: string, count: number): Observable<any> {
    return this.http.post<any>(
      `http://localhost:8081/api/users/${userId}/increment-stars`,
      { count }
    );
  }
}
