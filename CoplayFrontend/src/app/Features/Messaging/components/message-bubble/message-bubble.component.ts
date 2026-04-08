import { Component, Input } from '@angular/core';
import { Message } from 'src/app/Core/Models/Messaging/Message';

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.css']
})
export class MessageBubbleComponent {
  @Input() message!: Message;
  @Input() isOwn = false;
  
  showReactions = false;

  toggleReactions(): void {
    this.showReactions = !this.showReactions;
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}