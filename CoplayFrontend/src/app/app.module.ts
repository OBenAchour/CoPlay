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
import { EventListComponent } from './Features/Event & Training/event-list-component/event-list-component.component';
import { EventDetailComponent } from './Features/Event & Training/event-detail/event-detail.component';
import { EventFormComponent } from './Features/Event & Training/event-form/event-form.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    DashboardComponent,
    NavbarComponent,
    UserListComponent,
    ProfileComponent,
    EventListComponent,
    EventDetailComponent,
    EventFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
    FormsModule,   // <-- AJOUTER CECI
    ReactiveFormsModule  // <-- AJOUTER CECI
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }