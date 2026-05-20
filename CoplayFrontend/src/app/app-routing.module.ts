import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Auth & Core
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { AuthGuard } from './Core/Guards/auth.guard';
import { AdminGuard } from './Core/Guards/admin.guard';

// Shell
import { ShellComponent } from './Shared/Components/shell/shell.component';

// Features Common
import { HomeComponent } from './Features/home/home.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';

// Team Components
import { TeamComponent } from './components/team/team.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';
import { DemandeAdhesionComponent } from './components/demande-adhesion/demande-adhesion.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { CoachComponent } from './components/coach/coach.component';
import { EquipeSponsorComponent } from './components/equipe-sponsor/equipe-sponsor.component';
import { HistoriqueActionComponent } from './components/historique-action/historique-action.component';

// Messaging
import { MessagingComponent } from './Features/Messaging/messaging.component';

// Planning
import { PlanningComponent } from './Features/planning/planning.component';

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
  // ─── Pages publiques (pas de shell) ───
  { path: '',         component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login',    component: LoginComponent },

  // ─── Shell : toutes les routes authentifiées ───
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile',   component: ProfileComponent },

      // Events
      { path: 'events',              component: EventListComponent },
      { path: 'events/create',       component: EventFormComponent },
      { path: 'events/edit/:id',     component: EventFormComponent },
      { path: 'events/:id',          component: EventDetailComponent },

      // Training Programs
      { path: 'training-programs',        component: TrainingProgramListComponent },
      { path: 'training-programs/new',    component: TrainingProgramFormComponent },
      { path: 'training-programs/:id',    component: TrainingProgramDetailComponent },

      // Training Sessions
      { path: 'training-sessions',          component: TrainingListComponent },
      { path: 'training-sessions/new',      component: TrainingSessionFormComponent },
      { path: 'training-sessions/:id/edit', component: TrainingSessionFormComponent },
      { path: 'training-sessions/:id',      component: TrainingSessionDetailComponent },

      // Équipes
      { path: 'team',                component: TeamComponent },
      { path: 'team/demandes',       component: DemandeAdhesionComponent },
      { path: 'team/invitations',    component: InvitationComponent },
      { path: 'team/coach',          component: CoachComponent },
      { path: 'team/sponsors',       component: EquipeSponsorComponent },
      { path: 'team/historique',     component: HistoriqueActionComponent },
      { path: 'teammember',          component: TeamMemberComponent },

      // Compétitions — route statique AVANT la route paramétrée /:id
      { path: 'competitions',            component: CompetitionListComponent },
      { path: 'competitions/statistics', component: StatisticsComponent },
      { path: 'competitions/:id',        component: CompetitionDetailComponent },
      { path: 'classement',              component: ClassementComponent },
      { path: 'matchs',                  component: MatchListComponent },
      { path: 'matchs/:id',              component: MatchDetailComponent },

      // Social
      { path: 'feed', component: FeedComponent },

      // Messagerie
      { path: 'messaging', component: MessagingComponent },

      // Planning
      { path: 'planning', component: PlanningComponent },

      // Tickets
      { path: 'tickets/:matchId', component: TicketShopComponent },
      { path: 'my-tickets',       component: MyTicketsComponent },

      // Admin (inside shell, guards at route level)
      { path: 'admin/users',        component: UserListComponent,        canActivate: [AdminGuard] },
      { path: 'admin/reclamations', component: AdminReclamationComponent, canActivate: [AdminGuard] },

      // Marketplace (lazy)
      {
        path: 'marketplace',
        loadChildren: () => import('./Features/Marketplace/marketplace.module').then(m => m.MarketplaceModule),
      },
      // Coaching (lazy)
      {
        path: 'coaching',
        loadChildren: () => import('./Features/Coaching/coaching.module').then(m => m.CoachingModule),
      },
    ]
  },

  // Catch-all
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
