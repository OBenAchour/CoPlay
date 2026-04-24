import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Auth & Core
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { AuthInterceptor } from './Core/Interceptors/auth.interceptor';
import { ProfileComponent } from './Features/User/profile/profile.component';

// Features (Home & Admin)
import { HomeComponent } from './Features/home/home.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { NavbarComponent } from './Shared/Components/navbar/navbar.component';

// Messaging - On importe UNIQUEMENT le module
// Ne pas importer les composants individuels ici (ChatBubble, etc.) car ils sont déjà dans MessagingModule
import { MessagingModule } from './Features/Messaging/messaging.module';

// Team Components
import { TeamComponent } from './components/team/team.component';
import { CoachComponent } from './components/coach/coach.component';
import { DemandeAdhesionComponent } from './components/demande-adhesion/demande-adhesion.component';
import { EquipeSponsorComponent } from './components/equipe-sponsor/equipe-sponsor.component';
import { HistoriqueActionComponent } from './components/historique-action/historique-action.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';

// Event & Training Components
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';
import { TrainingListComponent } from './Features/Event & Training/training-list/training-list.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    DashboardComponent,
    NavbarComponent,
    UserListComponent,
    ProfileComponent,
    HomeComponent,
    
    // Events
    EventListComponent,
    EventDetailComponent,
    EventFormComponent,
    TrainingListComponent,

    // Teams
    TeamComponent,
    CoachComponent,
    DemandeAdhesionComponent,
    EquipeSponsorComponent,
    HistoriqueActionComponent,
    InvitationComponent,
    TeamMemberComponent
    
    // IMPORTANT : MessagingComponent et ses sous-composants sont déclarés 
    // dans MessagingModule, donc on ne les met PAS ici.
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
    FormsModule,   
    ReactiveFormsModule,
    MessagingModule // On importe le module global ici
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }