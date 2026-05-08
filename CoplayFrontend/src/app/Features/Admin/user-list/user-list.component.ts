import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../Core/Services/User/admin.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  errorMessage: string = '';

  // Liste exhaustive des rôles selon votre Enum Backend
  allRoles = ['ADMIN', 'COACH', 'PLAYER', 'SPECTATOR'];

  constructor(private adminService: AdminService) { }

  // Initialise le composant en lançant la récupération de la liste des utilisateurs
  ngOnInit(): void {
    this.loadUsers();
  }

  // Appelle le service d'administration pour récupérer tous les utilisateurs et gère les erreurs d'affichage
  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        console.error(err);
      }
    });
  }

  // Prépare l'édition d'un utilisateur en créant une copie profonde pour éviter les modifications en direct
  editUser(user: any): void {
    this.selectedUser = JSON.parse(JSON.stringify(user));
    if (!this.selectedUser.profile) {
      this.selectedUser.profile = { displayName: '' };
    }
  }

  // Enregistre les modifications apportées à l'utilisateur sélectionné et rafraîchit la liste
  saveChanges(): void {
    if (this.selectedUser) {
      this.adminService.updateUser(this.selectedUser.userId, this.selectedUser).subscribe({
        next: () => {
          this.selectedUser = null;
          this.loadUsers();
        },
        error: (err) => alert('Erreur lors de la mise à jour')
      });
    }
  }

  // Supprime un utilisateur après confirmation et actualise la liste des membres
  deleteUser(id: string): void {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.adminService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}