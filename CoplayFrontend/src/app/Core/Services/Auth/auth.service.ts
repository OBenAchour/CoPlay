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

  register(registerData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, registerData);
  }

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

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !this.jwtHelper.isTokenExpired(token);
  }

  getUserName(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || 'Utilisateur';
  }

  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.role || localStorage.getItem('user_role');
    }
    return localStorage.getItem('user_role');
  }

  getTokenExpiration(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      return expirationDate ? expirationDate.getTime() : null;
    }
    return null;
  }

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

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // ✅ URL corrigée — pointe vers /api/users/me/password
  // Le token est ajouté automatiquement par l'interceptor
  changePassword(data: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/users/me/password`, data);
  }
}