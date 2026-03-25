import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/Auth/auth.service'; // Ajuste le chemin si besoin

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  // C'est ici qu'on injecte les services pour enlever le rouge !
  constructor(private authService: AuthService, private router: Router) {}

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