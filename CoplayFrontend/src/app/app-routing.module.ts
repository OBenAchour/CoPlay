import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Auth/register/register.component'; 
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { AdminGuard } from './Core/Guards/admin.guard';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { AuthGuard } from './Core/Guards/auth.guard'; 


// Imports de la branche hsan
import { HomeComponent } from './Features/home/home.component';
import { TeamComponent } from './components/team/team.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';

// Imports de la branche main (Events)
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';


// Définition de la table de routage de l'application liant les URLs aux composants correspondants
const routes: Routes = [
  // Route principale (Accueil)
  { path: '', component: HomeComponent },

  // Route pour la création de compte
  { path: 'register', component: RegisterComponent },
  
  // Route pour l'authentification des utilisateurs
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard]} ,

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // --- NOUVELLES ROUTES : GESTION DES ÉVÉNEMENTS ---
  { path: 'events', component: EventListComponent, canActivate: [AuthGuard] },
  { path: 'events/create', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/edit/:id', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/:id', component: EventDetailComponent, canActivate: [AuthGuard] },
  
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