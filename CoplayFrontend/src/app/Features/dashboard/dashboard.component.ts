import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Core/Services/Auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  // Stocke le nom de l'utilisateur pour l'affichage dans le template du tableau de bord
  userName: string | null = '';

  // Injecte le service d'authentification pour accéder aux informations de session
  constructor(private authService: AuthService) {}

  // Initialise le composant en récupérant le nom de l'utilisateur connecté via le service AuthService
  ngOnInit(): void {
    this.userName = this.authService.getUserName();
  }
}