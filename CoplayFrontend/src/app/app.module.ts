import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // <-- AJOUTER CECI
import { ReactiveFormsModule } from '@angular/forms'; // Utile pour les formulaires plus tard

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
@NgModule({
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
    TeamMemberComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
    FormsModule,   
    ReactiveFormsModule 
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
