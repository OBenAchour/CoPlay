import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Auth/register/register.component'; // Vérifie bien le chemin
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { AdminGuard } from './Core/Guards/admin.guard';
import { ProfileComponent } from './Features/User/profile/profile.component';

import { AuthGuard } from './Core/Guards/auth.guard';
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';
import { TeamComponent } from './components/team/team.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';

// Training Sessions
import { TrainingListComponent } from './Features/Event & Training/training-list/training-list.component';
import { TrainingSessionFormComponent } from './Features/Event & Training/training-session-form/training-session-form.component';
import { TrainingSessionDetailComponent } from './Features/Event & Training/training-session-detail/training-session-detail.component';

// Training Programs
import { TrainingProgramListComponent } from './Features/Event & Training/training-program-list/training-program-list.component';
import { TrainingProgramFormComponent } from './Features/Event & Training/training-program-form/training-program-form.component';
import { TrainingProgramDetailComponent } from './Features/Event & Training/training-program-detail/training-program-detail.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
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


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
