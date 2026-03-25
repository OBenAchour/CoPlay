import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { SportLevel } from '../../Core/Models/Auth/SportLevel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  levels = Object.values(SportLevel); 
  passwordVisible: boolean = false;
  isSuccess: boolean = false; // État pour le message de succès

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', Validators.required],
      city: ['', Validators.required],
      level: [SportLevel.BEGINNER, Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Utilisateur créé !', response);
          this.isSuccess = true; // Affiche la bannière de succès
          
          // Redirection après 3 secondes
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          const errorMsg = err.error?.message || "Erreur de connexion au serveur";
          alert("Erreur : " + errorMsg);
        }
      });
    }
  }
}