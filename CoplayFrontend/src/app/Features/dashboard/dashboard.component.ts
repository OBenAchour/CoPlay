import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Core/Services/Auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  // 1. Déclare la variable userName ici !
  userName: string | null = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // 2. On récupère la valeur (assure-toi que getUserName() existe dans ton service)
    this.userName = this.authService.getUserName();
  }
}