import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../Core/Services/User/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  message: string = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getMyProfile().subscribe({
      next: (data) => this.user = data,
      error: (err) => console.error(err)
    });
  }

  saveProfile(): void {
    this.userService.updateProfile(this.user.profile).subscribe({
      next: () => {
        this.message = 'Profil mis à jour avec succès !';
        setTimeout(() => this.message = '', 3000);
      },
      error: () => this.message = 'Erreur lors de la mise à jour.'
    });
  }

  onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      // On utilise le nouveau nom ici
      this.user.profile.profilePicture = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
}