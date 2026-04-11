import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Auth/register/register.component';
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Features/dashboard/dashboard.component';
import { UserListComponent } from './Features/Admin/user-list/user-list.component';
import { AdminGuard } from './Core/Guards/admin.guard';
import { ProfileComponent } from './Features/User/profile/profile.component';
import { AuthGuard } from './Core/Guards/auth.guard';
import { ListingListComponent } from './Features/Marketplace/Pages/listing-list/listing-list.component';
import { ListingDetailComponent } from './Features/Marketplace/Pages/listing-detail/listing-detail.component';
import { CreateListingComponent } from './Features/Marketplace/Pages/create-listing/create-listing.component';
import { MyListingsComponent } from './Features/Marketplace/Pages/my-listings/my-listings.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'marketplace', component: ListingListComponent },
  { path: 'marketplace/create', component: CreateListingComponent, canActivate: [AuthGuard] },
  { path: 'marketplace/my-listings', component: MyListingsComponent, canActivate: [AuthGuard] },
  { path: 'marketplace/:id', component: ListingDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }