import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.css']
})
export class ChatBubbleComponent {
  @Output() toggleChat = new EventEmitter<void>();
  
  showBadge = true;
  unreadCount = 0;
}