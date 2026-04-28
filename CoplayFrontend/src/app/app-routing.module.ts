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
import { TeamMemberComponent } from './components/team-member/team-member.component';
import { DemandeAdhesionComponent } from './components/demande-adhesion/demande-adhesion.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { CoachComponent } from './components/coach/coach.component';
import { HistoriqueActionComponent } from './components/historique-action/historique-action.component';
import { EquipeSponsorComponent } from './components/equipe-sponsor/equipe-sponsor.component';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // Module Teams
  { path: 'team', component: TeamComponent },
  { path: 'team/:id', component: TeamDetailComponent },
  { path: 'adhesion', component: DemandeAdhesionComponent },

  // Gardés mais non exposés dans la nav
  { path: 'teammember', component: TeamMemberComponent },
  { path: 'invitation', component: InvitationComponent },
  { path: 'coach', component: CoachComponent },
  { path: 'historique', component: HistoriqueActionComponent },
  { path: 'sponsor', component: EquipeSponsorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
