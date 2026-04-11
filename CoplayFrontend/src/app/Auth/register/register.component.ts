import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { SportLevel } from '../../Core/Models/Auth/SportLevel';
import { Router } from '@angular/router';
import { NotificationService } from '../../Core/Services/Notification/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  levels = Object.values(SportLevel);
  passwordVisible: boolean = false;
  isSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
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
          this.isSuccess = true;
          this.notificationService.success('✅ Compte créé avec succès ! Veuillez vous connecter');

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          const errorMsg = err.error?.message || "Erreur de connexion au serveur";
          this.notificationService.error(`❌ ${errorMsg}`);
        }
      });
    } else {
      this.notificationService.warning('⚠️ Veuillez remplir tous les champs correctement');
    }
  }
}