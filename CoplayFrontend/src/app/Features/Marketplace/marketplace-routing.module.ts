import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../../Core/Guards/auth.guard';

import { ListingListComponent } from './Pages/listing-list/listing-list.component';
import { ListingDetailComponent } from './Pages/listing-detail/listing-detail.component';
import { CreateListingComponent } from './Pages/create-listing/create-listing.component';
import { MyListingsComponent } from './Pages/my-listings/my-listings.component';

const routes: Routes = [
  { path: '', component: ListingListComponent },
  { path: 'create', component: CreateListingComponent, canActivate: [AuthGuard] },
  { path: 'my-listings', component: MyListingsComponent, canActivate: [AuthGuard] },
  { path: ':id', component: ListingDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceRoutingModule { }
