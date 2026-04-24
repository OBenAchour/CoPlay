import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  // Injecte les services nécessaires pour vérifier l'état de connexion et gérer la navigation
  constructor(private authService: AuthService, private router: Router) {}

  // Vérifie si l'utilisateur est authentifié avant de lui permettre d'accéder à une route protégée
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      // Redirige l'utilisateur vers la page de connexion s'il n'est pas authentifié
      this.router.navigate(['/login']);
      return false;
    }
  }
}