import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Auth/register/register.component'; // Vérifie bien le chemin
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { AdminGuard } from './Core/Guards/admin.guard';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { AuthGuard } from './Core/Guards/auth.guard'; // <-- AJOUTE CET IMPORT
import { TeamComponent } from './components/team/team.component';
import {TeamMemberComponent} from "./components/team-member/team-member.component";
import {DemandeAdhesionComponent} from "./components/demande-adhesion/demande-adhesion.component";
import {InvitationComponent} from "./components/invitation/invitation.component";
import {CoachComponent} from "./components/coach/coach.component";
import {HistoriqueActionComponent} from "./components/historique-action/historique-action.component";
import {EquipeSponsorComponent} from "./components/equipe-sponsor/equipe-sponsor.component";

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' }, // <-- ICI IL MANQUE UNE VIRGULE
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard]} ,// <-- Sécurité maximale},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  //routiong pour le module Team
  { path: 'team', component: TeamComponent },
  { path: 'teammember', component: TeamMemberComponent },
  { path: 'adhesion', component: DemandeAdhesionComponent },
  { path: 'invitation', component: InvitationComponent },
  { path: 'coach', component: CoachComponent },
  { path: 'historique', component: HistoriqueActionComponent },
  { path: 'sponsor', component: EquipeSponsorComponent }





];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
