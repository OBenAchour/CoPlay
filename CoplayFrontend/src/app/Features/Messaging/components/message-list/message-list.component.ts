import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Message } from '../../../../Core/Models/Messaging/Message';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnChanges {
  @Input() messages: Message[] = [];
  @Input() currentUserId: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  isMyMessage(senderId: string): boolean {
    return senderId === this.currentUserId;
  }
}