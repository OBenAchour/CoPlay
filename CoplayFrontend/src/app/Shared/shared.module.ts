import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from './Components/page-header/page-header.component';
import { CounterComponent } from './Components/counter/counter.component';
import { AcwrGaugeComponent } from './Components/acwr-gauge/acwr-gauge.component';
import { RevealDirective } from './Directives/reveal.directive';

@NgModule({
  declarations: [
    PageHeaderComponent,
    CounterComponent,
    AcwrGaugeComponent,
    RevealDirective,
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    PageHeaderComponent,
    CounterComponent,
    AcwrGaugeComponent,
    RevealDirective,
  ],
})
export class SharedModule {}
