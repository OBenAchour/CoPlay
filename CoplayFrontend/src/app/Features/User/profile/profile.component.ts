import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../Core/Services/User/user.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  message: string = '';
  currentUserEmail: string = '';
  availableRoles = ['COACH', 'PLAYER', 'SPECTATOR'];

  showPwForm = false;
  showOld = false;
  showNew = false;
  showConfirm = false;

  pwData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  // Charge les données du profil au démarrage et initialise l'email de l'utilisateur
  ngOnInit(): void {
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;
        // Initialisation par défaut si les champs sont vides
        if (this.user && this.user.profile) {
          if (!this.user.profile.role) this.user.profile.role = 'PLAYER';
          if (!this.user.profile.bio) this.user.profile.bio = '';
        }
      },
      error: (err) => console.error('Erreur profil:', err)
    });

    const email = localStorage.getItem('user_email');
    this.currentUserEmail = email || JSON.parse(localStorage.getItem('user') || '{}').email || '';
  }

  // Enregistre les modifications globales du profil (pseudo, bio, rôle) via le service utilisateur
  saveProfile(): void {
    if (this.user?.profile) {
      this.userService.updateProfile(this.user.profile).subscribe({
        next: () => {
          this.message = 'Profil et bio mis à jour avec succès !';
          setTimeout(() => this.message = '', 3000);
        },
        error: () => this.message = 'Erreur lors de la mise à jour.'
      });
    }
  }

  // Vérifie les nouveaux mots de passe et appelle le service d'authentification pour effectuer le changement
  updatePassword(): void {
    if (!this.pwData.oldPassword || !this.pwData.newPassword || !this.pwData.confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    if (this.pwData.newPassword !== this.pwData.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    this.authService.changePassword({
      oldPassword: this.pwData.oldPassword,
      newPassword: this.pwData.newPassword
    }).subscribe({
      next: (res: any) => {
        alert(res.message || "Succès !");
        this.resetPwFields();
        this.showPwForm = false;
      },
      error: (err: any) => alert("Erreur : " + (err.error?.error || "Ancien mot de passe incorrect"))
    });
  }

  // Gère la sélection d'une image locale, la convertit en Base64 et l'assigne à l'aperçu du profil
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { 
        if (this.user?.profile) this.user.profile.profilePicture = reader.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }

  // Réinitialise les champs de saisie du mot de passe et masque les indicateurs de visibilité
  resetPwFields(): void {
    this.pwData = { oldPassword: '', newPassword: '', confirmPassword: '' };
    this.showOld = this.showNew = this.showConfirm = false;
  }

  // Annule la procédure de changement de mot de passe et ferme le formulaire dédié
  cancelPasswordChange(): void {
    this.showPwForm = false;
    this.resetPwFields();
  }
}