import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/Auth/auth.service'; // Ajuste le chemin si besoin

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  // Injecte le service d'authentification pour vérifier le rôle et le routeur pour la redirection
  constructor(private authService: AuthService, private router: Router) {}

  // Détermine si l'utilisateur a l'autorisation d'accéder à la route demandée (doit posséder le rôle 'ADMIN')
  canActivate(): boolean {
    const role = this.authService.getUserRole();
    
    if (role === 'ADMIN') {
      return true;
    } else {
      console.warn("Accès refusé : Rôle insuffisant");
      this.router.navigate(['/dashboard']); 
      return false;
    }
  }
}