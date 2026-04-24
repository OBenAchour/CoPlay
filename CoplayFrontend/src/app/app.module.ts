import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Important pour ngClass et les directives de base

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Auth & Core
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { AuthInterceptor } from './Core/Interceptors/auth.interceptor';

// Features
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { NavbarComponent } from './Shared/Components/navbar/navbar.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { ProfileComponent } from './Features/User/profile/profile.component';

// Messaging Module (Regroupe ChatBubble, MessageList, etc.)
import { MessagingModule } from './Features/Messaging/messaging.module';

// Team Components
import { TeamComponent } from './components/team/team.component';
import { CoachComponent } from './components/coach/coach.component';
import { DemandeAdhesionComponent } from './components/demande-adhesion/demande-adhesion.component';
import { EquipeSponsorComponent } from './components/equipe-sponsor/equipe-sponsor.component';
import { HistoriqueActionComponent } from './components/historique-action/historique-action.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';

// Event & Training Components (Conservation du nom de dossier avec "&")
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
    
    // Components Event & Training
    EventListComponent,
    EventDetailComponent,
    EventFormComponent,
    TrainingListComponent, // Ajouté pour corriger l'erreur NG8002

    // Components Team
    TeamComponent,
    CoachComponent,
    DemandeAdhesionComponent,
    EquipeSponsorComponent,
    HistoriqueActionComponent,
    InvitationComponent,
    TeamMemberComponent
    
    // Note : Les composants de messagerie sont déclarés dans MessagingModule
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