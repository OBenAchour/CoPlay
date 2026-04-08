import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBubbleComponent } from './components/chat-bubble/chat-bubble.component';
import { MessagingComponent } from './messaging.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { MessageBubbleComponent } from './components/message-bubble/message-bubble.component';
import { MessageInputComponent } from './components/message-input/message-input.component';
import { TypingIndicatorComponent } from './components/typing-indicator/typing-indicator.component';

@NgModule({
  declarations: [
    MessagingComponent,
    ChatWindowComponent,
    MessageListComponent,
    MessageBubbleComponent,
    MessageInputComponent,
    TypingIndicatorComponent,
    ChatBubbleComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    MessagingComponent
  ]
})
export class MessagingModule {}