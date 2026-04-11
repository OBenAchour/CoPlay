import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../Core/Services/Notification/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordVisible: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);
          this.notificationService.success('👋 Bienvenue ! Connexion réussie');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = "Email ou mot de passe incorrect.";
          this.notificationService.error('❌ Email ou mot de passe incorrect');
          console.error(err);
        }
      });
    } else {
      this.notificationService.warning('⚠️ Veuillez remplir tous les champs correctement');
    }
  }
}