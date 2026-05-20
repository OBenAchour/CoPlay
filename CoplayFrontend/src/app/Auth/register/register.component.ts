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

  // Calcule la force du mot de passe (0 à 4)
  get passwordStrength(): number {
    const pwd = this.registerForm.get('password')?.value || '';
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  }

  get passwordStrengthLabel(): string {
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    return labels[this.passwordStrength] || '';
  }

  get passwordStrengthColor(): string {
    const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E'];
    return colors[this.passwordStrength] || '';
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

  villesTunisie = [
    'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana',
    'Gafsa', 'Monastir', 'Ben Arous', 'Kasserine', 'Médenine', 'Nabeul',
    'Tataouine', 'Béja', 'Jendouba', 'El Kef', 'Mahdia', 'Sidi Bouzid',
    'Tozeur', 'Siliana', 'Zaghouan', 'Kebili', 'Manouba', 'La Marsa',
    'Hammam-Lif', 'La Soukra', 'Radès', 'Zarzis', 'Djerba', 'Hammamet',
    'Nabeul', 'Korba', 'Kélibia', 'Mateur', 'Menzel Bourguiba'
  ];

  villesFiltrees: string[] = [];
  afficherSuggestions = false;

  filtrerVilles(event: Event): void {
    const valeur = (event.target as HTMLInputElement).value.toLowerCase();
    if (valeur.length < 1) {
      this.villesFiltrees = [];
      this.afficherSuggestions = false;
      return;
    }
    this.villesFiltrees = this.villesTunisie.filter(v =>
      v.toLowerCase().includes(valeur)
    );
    this.afficherSuggestions = true;
  }

  selectionnerVille(ville: string): void {
    this.registerForm.get('city')?.setValue(ville);
    this.afficherSuggestions = false;
    this.villesFiltrees = [];
  }

  cacherSuggestions(): void {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => this.afficherSuggestions = false, 200);
  }
}
