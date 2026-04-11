import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ListingListComponent } from './Pages/listing-list/listing-list.component';
import { ListingDetailComponent } from './Pages/listing-detail/listing-detail.component';
import { CreateListingComponent } from './Pages/create-listing/create-listing.component';
import { MyListingsComponent } from './Pages/my-listings/my-listings.component';
import { MarketplaceRoutingModule } from './marketplace-routing.module';

@NgModule({
  declarations: [
    ListingListComponent,
    ListingDetailComponent,
    CreateListingComponent,
    MyListingsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MarketplaceRoutingModule
  ]
})
export class MarketplaceModule { }
