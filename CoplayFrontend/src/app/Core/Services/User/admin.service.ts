// Core/Services/User/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Définition de l'URL de base pour les appels API réservés aux administrateurs
  private apiUrl = 'http://localhost:8080/api/admin'; 

  constructor(private http: HttpClient) { }

  // Récupère la liste complète des utilisateurs enregistrés dans le système
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  // Met à jour les informations d'un utilisateur spécifique identifié par son ID
  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  // Supprime définitivement un compte utilisateur de la base de données
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  // Déclenche une procédure de réinitialisation du mot de passe pour un utilisateur donné
  resetUserPassword(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/reset-password`, {});
  }
}