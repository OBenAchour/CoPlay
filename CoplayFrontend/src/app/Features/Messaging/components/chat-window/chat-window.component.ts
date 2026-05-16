import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConversationListItem } from 'src/app/Core/Models/Messaging/ConversationListItem';
import { Message } from 'src/app/Core/Models/Messaging/Message';
import { CallService } from 'src/app/Core/Services/Call/call.service';

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

  // Inputs pour les appels
  @Input() activeCall: any = null;
  @Input() incomingCall: any = null;

  // Outputs
  @Output() close = new EventEmitter<void>();
  @Output() selectConversation = new EventEmitter<ConversationListItem | null>();
  @Output() sendMessage = new EventEmitter<string>();
  @Output() searchConversation = new EventEmitter<string>();
  @Output() newMessage = new EventEmitter<void>();
  @Output() acceptCall = new EventEmitter<void>();
  @Output() declineCall = new EventEmitter<void>();
  @Output() endCall = new EventEmitter<void>();
  @Output() callStarted = new EventEmitter<{ callId: string; roomId: string; type: 'AUDIO' | 'VIDEO' }>();

  searchQuery = '';
  messageInput = '';

  constructor(private callService: CallService) {}

  onSendMessage(): void {
    if (this.messageInput.trim()) {
      this.sendMessage.emit(this.messageInput);
      this.messageInput = '';
    }
  }

  onSearch(query: string): void {
    this.searchConversation.emit(query);
  }

  isSelected(conv: ConversationListItem): boolean {
    return this.selectedConversation?.conversationId === conv.conversationId;
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr + 'Z');
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr + 'Z');
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  formatLastSeen(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  startCall(type: 'AUDIO' | 'VIDEO'): void {
    if (this.selectedConversation?.conversationId) {
      this.callService.startCall(this.selectedConversation.conversationId, type).subscribe({
        next: (call) => {
          console.log('Call started:', call);
          this.callStarted.emit({ callId: call.callId, roomId: call.roomId, type });
        },
        error: (err) => {
          console.error('Failed to start call:', err);
        }
      });
    }
  }
}