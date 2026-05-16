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
import { MatchDetailComponent } from './Features/Competitions/components/match-detail.component';
import { StatisticsComponent } from './Features/Competitions/components/statistics.component';
import { TrainingProgramListComponent } from '@events/training-program-list/training-program-list.component';
import { TrainingProgramFormComponent } from '@events/training-program-form/training-program-form.component';
import { TrainingProgramDetailComponent } from '@events/training-program-detail/training-program-detail.component';
import { TrainingListComponent } from '@events/training-list/training-list.component';
import { TrainingSessionFormComponent } from '@events/training-session-form/training-session-form.component';
import { TrainingSessionDetailComponent } from '@events/training-session-detail/training-session-detail.component';
import { AdminReclamationComponent } from './components/admin-reclamation/admin-reclamation.component';
import { TicketShopComponent } from './Features/Tickets/ticket-shop/ticket-shop.component';
import { MyTicketsComponent } from './Features/Tickets/my-tickets/my-tickets.component';

// Social
import { FeedComponent } from './Features/Social/feed/feed.component';

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

  // Events
  { path: 'events', component: EventListComponent, canActivate: [AuthGuard] },
  { path: 'events/create', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/edit/:id', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/:id', component: EventDetailComponent, canActivate: [AuthGuard] },

  // Training Programs
  { path: 'training-programs', component: TrainingProgramListComponent, canActivate: [AuthGuard] },
  { path: 'training-programs/new', component: TrainingProgramFormComponent, canActivate: [AuthGuard] },
  { path: 'training-programs/:id', component: TrainingProgramDetailComponent, canActivate: [AuthGuard] },

  // Training Sessions
  { path: 'training-sessions', component: TrainingListComponent, canActivate: [AuthGuard] },
  { path: 'training-sessions/new', component: TrainingSessionFormComponent, canActivate: [AuthGuard] },
  { path: 'training-sessions/:id/edit', component: TrainingSessionFormComponent, canActivate: [AuthGuard] },
  { path: 'training-sessions/:id', component: TrainingSessionDetailComponent, canActivate: [AuthGuard] },

  // Équipes
  { path: 'team', component: TeamComponent, canActivate: [AuthGuard] },
  { path: 'teammember', component: TeamMemberComponent, canActivate: [AuthGuard] },

  // Compétitions
  { path: 'competitions', component: CompetitionListComponent, canActivate: [AuthGuard] },
  { path: 'competitions/:id', component: CompetitionDetailComponent, canActivate: [AuthGuard] },
  { path: 'classement', component: ClassementComponent, canActivate: [AuthGuard] },
  { path: 'matchs', component: MatchListComponent, canActivate: [AuthGuard] },
  { path: 'matchs/:id', component: MatchDetailComponent, canActivate: [AuthGuard] },


  // Réclamations admin
  { path: 'admin/reclamations', component: AdminReclamationComponent, canActivate: [AdminGuard] },

  // Social Media
  { path: 'feed', component: FeedComponent, canActivate: [AuthGuard] },

  // Tickets
  { path: 'tickets/:matchId', component: TicketShopComponent, canActivate: [AuthGuard] },
  { path: 'my-tickets', component: MyTicketsComponent, canActivate: [AuthGuard] },

  // Redirection par défaut pour les routes inconnues
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }