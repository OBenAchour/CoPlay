import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Conversation } from 'src/app/Core/Models/Messaging/Conversation';
import { Message } from 'src/app/Core/Models/Messaging/Message';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent {
  @Input() conversations: Conversation[] = [];
  @Input() selectedConversation: Conversation | null = null;
  @Input() messages: Message[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() selectConversation = new EventEmitter<Conversation>();
  @Output() sendMessage = new EventEmitter<string>();
  @Output() searchConversation = new EventEmitter<string>();
  @Output() newMessage = new EventEmitter<void>()	
  searchQuery = '';
  messageInput = '';

  onSendMessage(): void {
    if (this.messageInput.trim()) {
      this.sendMessage.emit(this.messageInput.trim());
      this.messageInput = '';
    }
  }

  onSearch(query: string): void {
    this.searchConversation.emit(query);
  }
}