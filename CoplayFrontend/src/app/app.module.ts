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
    MessagingComponent
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