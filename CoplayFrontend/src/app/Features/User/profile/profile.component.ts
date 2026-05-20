import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../Core/Services/User/user.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  message: string = '';
  currentUserEmail: string = '';
  availableRoles = ['CAPTAIN', 'COACH', 'PLAYER', 'SPECTATOR'];

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
        // Normalisation : certains backends retournent un objet plat (sans sous-objet profile)
        if (this.user && !this.user.profile) {
          this.user.profile = {
            displayName : this.user.displayName || this.user.username || '',
            bio         : this.user.bio         || '',
            role        : this.user.role         || localStorage.getItem('user_role') || 'PLAYER',
            city        : this.user.city         || '',
            phone       : this.user.phone        || '',
            avatarUrl   : this.user.avatarUrl    || '',
            profilePicture: this.user.profilePicture || ''
          };
        }
        if (this.user?.profile) {
          if (!this.user.profile.role) this.user.profile.role = localStorage.getItem('user_role') || 'PLAYER';
          if (!this.user.profile.bio)  this.user.profile.bio  = '';
        }
      },
      error: (err) => console.error('Erreur profil:', err)
    });

    const email = localStorage.getItem('user_email');
    this.currentUserEmail = email || JSON.parse(localStorage.getItem('user') || '{}').email || '';
  }

  // Enregistre les modifications globales du profil (pseudo, bio, rôle) via le service utilisateur
  saveProfile(): void {
    const profile = this.user?.profile;
    if (!profile) { this.message = 'Impossible de charger le profil.'; return; }

    // Mise à jour immédiate dans localStorage (avant confirmation API)
    // pour que les autres composants voient le nouveau rôle instantanément
    if (profile.role)        localStorage.setItem('user_role', profile.role);
    if (profile.displayName) localStorage.setItem('user_name', profile.displayName);

    this.userService.updateProfile(profile).subscribe({
      next: () => {
        this.message = 'Profil mis à jour avec succès !';
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = 'Erreur lors de la mise à jour du profil.';
        setTimeout(() => this.message = '', 4000);
      }
    });
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
        if (this.user?.profile) {
          this.user.profile.profilePicture = reader.result as string;
          this.user.profile.avatarUrl      = reader.result as string; // mise à jour immédiate de l'aperçu
        }
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