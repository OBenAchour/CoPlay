import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  // ⬇️ NOUVEAU
  isEventsDropdownOpen = false;
  // ⬆️
  // Injecte AuthService en public pour y accéder directement depuis le template HTML (ex: vérification isLoggedIn)
  constructor(
  public authService: AuthService,
  public router: Router // Ajoute ceci ici
) {}

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
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