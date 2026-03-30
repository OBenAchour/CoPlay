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
  loginData = { email: '', password: '' };
  isLoading = false;

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
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);
          this.router.navigate(['/dashboard']); // Redirection vers le dashboard
        },
        error: (err) => {
          this.errorMessage = "Email ou mot de passe incorrect.";
          console.error(err);
        }
      });
    }
  }

  forgotPassword(): void {
  const email = prompt("Entrez votre email :");
  if (email) {
    this.authService.forgotPassword(email).subscribe({
      next: (res) => alert("Succès : " + res.message),
      error: (err) => alert("Erreur : " + (err.error?.error || "Email introuvable"))
    });
  }
}
}