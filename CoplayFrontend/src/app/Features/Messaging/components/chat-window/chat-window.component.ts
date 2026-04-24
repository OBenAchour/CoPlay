import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ConversationListItem } from '../../../../Core/Models/Messaging/ConversationListItem';
import { Message } from '../../../../Core/Models/Messaging/Message';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent {
  @Input() conversations: ConversationListItem[] = [];
  @Input() selectedConversation: ConversationListItem | null = null;
  @Input() messages: Message[] = [];
  @Input() currentUserId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() selectConversation = new EventEmitter<ConversationListItem>();
  @Output() sendMessage = new EventEmitter<string>();
  @Output() searchConversation = new EventEmitter<string>();
  @Output() newMessage = new EventEmitter<void>();

  searchQuery = '';
  messageInput = '';

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Maintenant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  getConversationName(conv: ConversationListItem): string {
    return conv?.name || 'Sans nom';
  }

  isSelected(conv: ConversationListItem): boolean {
    return !!this.selectedConversation && this.selectedConversation.conversationId === conv.conversationId;
  }

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