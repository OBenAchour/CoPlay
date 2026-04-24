import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; 
import { ReactiveFormsModule } from '@angular/forms'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { NavbarComponent } from './Shared/Components/navbar/navbar.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './Core/Interceptors/auth.interceptor';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { ChatBubbleComponent } from './Features/Messaging/components/chat-bubble/chat-bubble.component';
import { ChatWindowComponent } from './Features/Messaging/components/chat-window/chat-window.component';
import { MessageListComponent } from './Features/Messaging/components/message-list/message-list.component';
import { MessageBubbleComponent } from './Features/Messaging/components/message-bubble/message-bubble.component';
import { MessageInputComponent } from './Features/Messaging/components/message-input/message-input.component';
import { TypingIndicatorComponent } from './Features/Messaging/components/typing-indicator/typing-indicator.component';
import { MessagingComponent } from './Features/Messaging/messaging.component';
import { TeamComponent } from './components/team/team.component';
import { CoachComponent } from './components/coach/coach.component';
import { DemandeAdhesionComponent } from './components/demande-adhesion/demande-adhesion.component';
import { EquipeSponsorComponent } from './components/equipe-sponsor/equipe-sponsor.component';
import { HistoriqueActionComponent } from './components/historique-action/historique-action.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { TeamMemberComponent } from './components/team-member/team-member.component';
import { HomeComponent } from './Features/home/home.component';

@NgModule({
  // Répertorie tous les composants, directives et pipes appartenant à ce module
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    DashboardComponent,
    NavbarComponent,
    UserListComponent,
    ProfileComponent,
    ChatBubbleComponent,
    MessageListComponent,
    MessageBubbleComponent,
    ChatWindowComponent,
    MessageInputComponent,
    TypingIndicatorComponent,
    MessagingComponent,
    TeamComponent,
    CoachComponent,
    DemandeAdhesionComponent,
    EquipeSponsorComponent,
    HistoriqueActionComponent,
    InvitationComponent,
    TeamMemberComponent,
    HomeComponent
  ],
  // Importe les modules externes nécessaires au fonctionnement des composants (Navigation, Formulaires, Requêtes HTTP)
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
    FormsModule,   
    ReactiveFormsModule 
  ],
  // Déclare les services et les intercepteurs (ici l'intercepteur de jeton JWT pour les appels API)
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  // Définit le composant racine que Angular doit charger au démarrage de l'application
  bootstrap: [AppComponent]
})
export class AppModule { }