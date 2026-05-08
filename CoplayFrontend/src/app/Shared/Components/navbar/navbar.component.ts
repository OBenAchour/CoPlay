import { Component } from '@angular/core';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

    isEventsDropdownOpen = false;

  
  // Injecte AuthService en public pour y accéder directement depuis le template HTML (ex: vérification isLoggedIn)
  constructor(public authService: AuthService, private router: Router) {}

  // Gère la déconnexion de l'utilisateur en nettoyant la session et en redirigeant vers la page de login
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ⬇️ NOUVEAU : ouvrir/fermer le menu
  toggleEventsDropdown(): void {
    this.isEventsDropdownOpen = !this.isEventsDropdownOpen;
  }

  closeEventsDropdown(): void {
    this.isEventsDropdownOpen = false;
  }
  // ⬆️
  
}