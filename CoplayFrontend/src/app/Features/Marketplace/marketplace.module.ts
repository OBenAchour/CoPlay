import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MarketplaceHomeComponent } from './components/marketplace-home.component';
import { EquipmentDetailComponent } from './components/equipment-detail.component';
import { EquipmentFormComponent } from './components/equipment-form.component';
import { MyListingsComponent } from './components/my-listings.component';
import { CartComponent } from './components/cart.component';
import { CheckoutComponent } from './components/checkout.component';
import { OrdersComponent } from './components/orders.component';
import { MarketplaceChatbotComponent } from './components/ai-chatbot.component';
import { SharedModule } from '../../Shared/shared.module';

const routes: Routes = [
  { path: '', component: MarketplaceHomeComponent },
  { path: 'my', component: MyListingsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'chatbot', component: MarketplaceChatbotComponent },
  { path: 'equipment/new', component: EquipmentFormComponent },
  { path: 'equipment/:id/edit', component: EquipmentFormComponent },
  { path: 'equipment/:id', component: EquipmentDetailComponent },
];

@NgModule({
  declarations: [
    MarketplaceHomeComponent,
    EquipmentDetailComponent,
    EquipmentFormComponent,
    MyListingsComponent,
    CartComponent,
    CheckoutComponent,
    OrdersComponent,
    MarketplaceChatbotComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), SharedModule],
})
export class MarketplaceModule {}
