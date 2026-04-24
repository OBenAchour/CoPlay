import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Auth & Core
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { AuthGuard } from './Core/Guards/auth.guard';
import { AdminGuard } from './Core/Guards/admin.guard';

// Features Common
import { HomeComponent } from './Features/home/home.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';

// Team Components
import { TeamComponent } from './components/team/team.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';

// Event & Training Components
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';

// Competition Components
import { CompetitionListComponent } from './Features/Competitions/components/competition-list.component';
import { CompetitionDetailComponent } from './Features/Competitions/components/competition-detail.component';
import { ClassementComponent } from './Features/Competitions/components/classement.component';
import { MatchListComponent } from './Features/Competitions/components/match-list.component';
import { StatisticsComponent } from './Features/Competitions/components/statistics.component';

const routes: Routes = [
  // Route principale (Accueil)
  { path: '', component: HomeComponent },

  // Auth
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  
  // Dashboard & Admin
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // Événements & Entraînements
  { path: 'events', component: EventListComponent, canActivate: [AuthGuard] },
  { path: 'events/create', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/edit/:id', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/:id', component: EventDetailComponent, canActivate: [AuthGuard] },

  // Équipes
  { path: 'team', component: TeamComponent, canActivate: [AuthGuard] },
  { path: 'teammember', component: TeamMemberComponent, canActivate: [AuthGuard] },

  // Compétitions
  { path: 'competitions', component: CompetitionListComponent, canActivate: [AuthGuard] },
  { path: 'competitions/:id', component: CompetitionDetailComponent, canActivate: [AuthGuard] },
  { path: 'classement', component: ClassementComponent, canActivate: [AuthGuard] },
  { path: 'matchs', component: MatchListComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },

  // Redirection par défaut pour les routes inconnues
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }