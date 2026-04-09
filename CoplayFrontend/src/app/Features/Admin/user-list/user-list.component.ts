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

  ngOnInit(): void {
    this.loadUsers();
  }

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

  editUser(user: any): void {
    this.selectedUser = JSON.parse(JSON.stringify(user));
    if (!this.selectedUser.profile) {
      this.selectedUser.profile = { displayName: '' };
    }
  }

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

  deleteUser(id: string): void {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.adminService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}