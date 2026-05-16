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

// Planning (cross-module calendar)
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
import { StatisticsComponent } from './Features/Competitions/components/statistics.component';
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

  // Marketplace (lazy-loaded feature module)
  {
    path: 'marketplace',
    canActivate: [AuthGuard],
    loadChildren: () => import('./Features/Marketplace/marketplace.module').then(m => m.MarketplaceModule),
  },

  // Coaching & Suivi Santé (lazy-loaded feature module)
  {
    path: 'coaching',
    canActivate: [AuthGuard],
    loadChildren: () => import('./Features/Coaching/coaching.module').then(m => m.CoachingModule),
  },

  // Planning unifié (cross-module: coaching sessions + marketplace bookings + events + matches)
  { path: 'planning', component: PlanningComponent, canActivate: [AuthGuard] },
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
