import { Component } from '@angular/core';
import { AuthService } from './Core/Services/Auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CoplayFrontend';

  constructor(public authService: AuthService) {}
}