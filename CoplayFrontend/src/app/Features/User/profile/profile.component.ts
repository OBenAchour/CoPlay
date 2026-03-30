import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../Core/Services/User/user.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // --- Données Profil ---
  user: any = null;
  message: string = '';
  currentUserEmail: string = '';

  // --- Données Mot de Passe ---
  showPwForm = false;
  
  // Correction ici : On crée l'objet pwData attendu par le HTML
  pwData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  pwError: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // 1. Récupération des données du profil
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => console.error('Erreur profil:', err)
    });

    // 2. Récupération de l'email
    const email = localStorage.getItem('user_email');
    if (email) {
      this.currentUserEmail = email;
    } else {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      this.currentUserEmail = storedUser.email || '';
    }
  }

  // SAUVEGARDE DU PROFIL (Nom, Ville, etc.)
  saveProfile(): void {
    this.message = '';
    if (this.user && this.user.profile) {
      this.userService.updateProfile(this.user.profile).subscribe({
        next: () => {
          this.message = 'Profil mis à jour avec succès !';
          setTimeout(() => this.message = '', 3000);
        },
        error: () => this.message = 'Erreur lors de la mise à jour du profil.'
      });
    }
  }

  // MISE À JOUR DU MOT DE PASSE
  updatePassword(): void {
    // On utilise this.pwData pour les validations
    if (!this.pwData.oldPassword || !this.pwData.newPassword || !this.pwData.confirmPassword) {
      alert("Veuillez remplir tous les champs du mot de passe.");
      return;
    }

    if (this.pwData.newPassword !== this.pwData.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    // Préparation de l'envoi au backend
    const payload = {
      oldPassword: this.pwData.oldPassword,
      newPassword: this.pwData.newPassword
    };

    this.authService.changePassword(payload).subscribe({
      next: (res: any) => {
        alert(res.message || "Mot de passe mis à jour avec succès !");
        this.resetPwFields();
        this.showPwForm = false;
      },
      error: (err: any) => {
        console.error('Erreur backend:', err);
        const errorMessage = err.error?.error || err.error?.message || "Ancien mot de passe incorrect";
        alert("Erreur : " + errorMessage);
      }
    });
  }

  // GESTION DE LA PHOTO
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.user && this.user.profile) {
          this.user.profile.profilePicture = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  resetPwFields(): void {
    this.pwData = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.pwError = '';
  }

  cancelPasswordChange(): void {
    this.showPwForm = false;
    this.resetPwFields();
  }
}