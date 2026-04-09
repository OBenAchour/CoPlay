import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.css']
})
export class ChatBubbleComponent {
  @Input() unreadCount: number = 0;
  @Output() toggleChat = new EventEmitter<void>();
  showBadge = true;
}