import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordVisible: boolean = false;
  errorMessage: string = '';
  isLoading = false;

  // Variables pour le modal "Mot de passe oublié"
  showForgotModal: boolean = false;
  forgotEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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
      this.errorMessage = '';
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Connexion réussie', response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
  this.isLoading = false;
  
  // Le backend envoie maintenant { "message": "Votre compte est bloqué..." }
  if (err.error && err.error.message) {
    this.errorMessage = err.error.message;
  } else if (typeof err.error === 'string') {
    this.errorMessage = err.error;
  } else {
    this.errorMessage = "Email ou mot de passe incorrect.";
  }
}
      });
    }
  }

  // === GESTION DU MODAL (RÉPARE VOS ERREURS TS2339) ===

  openForgotPasswordModal(): void {
    this.forgotEmail = '';
    this.showForgotModal = true;
    this.errorMessage = ''; // Optionnel : nettoie les erreurs de login en ouvrant le modal
  }

  closeForgotPasswordModal(): void {
    this.showForgotModal = false;
    this.forgotEmail = '';
  }

  sendForgotPassword(): void {
    if (!this.forgotEmail) return;

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res) => {
        alert("Succès : " + (res.message || "Un email de récupération a été envoyé."));
        this.closeForgotPasswordModal();
      },
      error: (err) => {
        alert("Erreur : " + (err.error?.error || err.error?.message || "Email introuvable"));
      }
    });
  }
}