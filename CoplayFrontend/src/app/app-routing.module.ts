import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { AdminGuard } from './Core/Guards/admin.guard';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { AuthGuard } from './Core/Guards/auth.guard';
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';



const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // ✅ AJOUTE CES ROUTES POUR EVENTS
  { path: 'events', component: EventListComponent, canActivate: [AuthGuard] },
  { path: 'events/create', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/edit/:id', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/:id', component: EventDetailComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }