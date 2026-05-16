import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Auth & Core
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { AuthInterceptor } from './Core/Interceptors/auth.interceptor';
import { ProfileComponent } from './Features/User/profile/profile.component';

// Features
import { HomeComponent } from './Features/home/home.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { NavbarComponent } from './Shared/Components/navbar/navbar.component';

// Messaging
import { MessagingModule } from './Features/Messaging/messaging.module';

// Social
import { SocialModule } from './Features/Social/social.module';

// Team Components
import { TeamComponent } from './components/team/team.component';
import { CoachComponent } from './components/coach/coach.component';
import { DemandeAdhesionComponent } from './components/demande-adhesion/demande-adhesion.component';
import { EquipeSponsorComponent } from './components/equipe-sponsor/equipe-sponsor.component';
import { HistoriqueActionComponent } from './components/historique-action/historique-action.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';

// Events
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';
import { TrainingListComponent } from './Features/Event & Training/training-list/training-list.component';
import { TrainingSessionFormComponent } from '@events/training-session-form/training-session-form.component';
import { TrainingSessionDetailComponent } from '@events/training-session-detail/training-session-detail.component';
import { TrainingProgramListComponent } from '@events/training-program-list/training-program-list.component';
import { TrainingProgramFormComponent } from '@events/training-program-form/training-program-form.component';
import { TrainingProgramDetailComponent } from '@events/training-program-detail/training-program-detail.component';
import { MapComponent } from './Features/Event & Training/map/map.component';
;

// Reclamations
import { AdminReclamationComponent } from './components/admin-reclamation/admin-reclamation.component';

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
    TrainingSessionFormComponent,
    TrainingSessionDetailComponent,
    TrainingProgramListComponent,
    TrainingProgramFormComponent,
    TrainingProgramDetailComponent,

    // Teams
    TeamComponent,
    CoachComponent,
    DemandeAdhesionComponent,
    EquipeSponsorComponent,
    HistoriqueActionComponent,
    InvitationComponent,
    TeamMemberComponent,
   
    
    // Note : Les composants de messagerie (ChatBubble, etc.) sont déclarés 
    // Reclamations
    AdminReclamationComponent,
    // Note: FeedComponent est déclaré dans SocialModule
    // Note: Les composants de messagerie (ChatBubble, etc.) sont déclarés
    // exclusivement dans MessagingModule, pas ici.
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,        // Fournit ngClass, ngIf, ngFor
    AppRoutingModule,
    HttpClientModule, 
    FormsModule,           // Fournit ngModel
    ReactiveFormsModule,   // Fournit formGroup
    MessagingModule,
     MapComponent,
        SocialModule,           // Social media module

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }