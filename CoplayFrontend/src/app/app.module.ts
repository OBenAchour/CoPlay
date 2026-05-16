import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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

// Features (Home, Admin & Shared)
import { HomeComponent } from './Features/home/home.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { NavbarComponent } from './Shared/Components/navbar/navbar.component';

// Messaging - On importe UNIQUEMENT le module global
import { MessagingModule } from './Features/Messaging/messaging.module';

// Team Components
import { TeamComponent } from './components/team/team.component';
import { CoachComponent } from './components/coach/coach.component';
import { DemandeAdhesionComponent } from './components/demande-adhesion/demande-adhesion.component';
import { EquipeSponsorComponent } from './components/equipe-sponsor/equipe-sponsor.component';
import { HistoriqueActionComponent } from './components/historique-action/historique-action.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';

// Event & Training Components (Conservation du dossier avec "&")
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';
import { TrainingListComponent } from './Features/Event & Training/training-list/training-list.component';

// Coaching & Marketplace are lazy-loaded feature modules (see app-routing.module.ts)

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
    
    // Events & Training
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

    // Note : Les composants de messagerie (ChatBubble, etc.) sont déclarés
    // exclusivement dans MessagingModule, pas ici.
    // Note : Les composants Coaching et Marketplace sont dans leurs propres
    // feature modules lazy-loaded.
  ],
  imports: [
    BrowserModule,
    CommonModule,        // Fournit ngClass, ngIf, ngFor
    AppRoutingModule,
    HttpClientModule, 
    FormsModule,           // Fournit ngModel
    ReactiveFormsModule,   // Fournit formGroup
    MessagingModule        // Importé ici pour éviter les doublons de déclaration
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }