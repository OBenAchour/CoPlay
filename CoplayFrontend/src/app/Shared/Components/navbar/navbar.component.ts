import { Component } from '@angular/core';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../Core/Services/Notification/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onLogout() {
    this.authService.logout();
    this.notificationService.info('👋 Déconnexion réussie');
    this.router.navigate(['/login']);
  }
}