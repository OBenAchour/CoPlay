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

  // Initialise le formulaire avec les champs requis et les règles de validation (email, mot de passe, profil)
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', Validators.required],
      city: ['', Validators.required],
      level: [SportLevel.BEGINNER, Validators.required]
    });
  }

  // Permet de basculer l'affichage du mot de passe entre le mode masqué et le mode texte
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Traite l'envoi du formulaire, crée l'utilisateur via le service et redirige vers la connexion en cas de succès
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Utilisateur créé !', response);
          this.isSuccess = true; // Affiche la bannière de succès
          
          // Redirection vers la page de login après un délai de 3 secondes
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