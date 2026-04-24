import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Auth/register/register.component'; 
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { AdminGuard } from './Core/Guards/admin.guard';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { AuthGuard } from './Core/Guards/auth.guard'; 
import { TeamComponent } from './components/team/team.component';
import { TeamMemberComponent } from "./components/team-member/team-member.component";
import { HomeComponent } from './Features/home/home.component';

// Définition de la table de routage de l'application liant les URLs aux composants correspondants
const routes: Routes = [
  { path: '', component: HomeComponent },
  // Route pour la création de compte
  { path: 'register', component: RegisterComponent },
  
  // Route pour l'authentification des utilisateurs
  { path: 'login', component: LoginComponent },
  
  // Redirection automatique vers l'inscription si l'URL est vide
  { path: '', redirectTo: '/register', pathMatch: 'full' }, 
  
  // Route principale après connexion affichant le tableau de bord
  { path: 'dashboard', component: DashboardComponent },
  
  // Route d'administration protégée par AdminGuard (accessible uniquement aux administrateurs)
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard] },
  
  // Route du profil personnel protégée par AuthGuard (nécessite d'être connecté)
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  
  // Route affichant la liste des équipes ou les informations générales de l'équipe
  { path: 'team', component: TeamComponent },
  
  // Route dédiée à l'affichage ou la gestion des membres de l'équipe
  { path: 'teammember', component: TeamMemberComponent }
];

@NgModule({
  // Initialise le routeur avec la configuration des routes définie ci-dessus
  imports: [RouterModule.forRoot(routes)],
  // Exporte RouterModule pour qu'il soit disponible dans toute l'application
  exports: [RouterModule]
})
export class AppRoutingModule { }