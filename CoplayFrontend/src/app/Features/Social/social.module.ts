import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeedComponent } from './feed/feed.component';

@NgModule({
  declarations: [
    FeedComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FeedComponent
  ]
})
export class SocialModule { }
