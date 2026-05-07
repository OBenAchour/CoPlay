import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Message } from '../../../../Core/Models/Messaging/Message';

interface MessageGroup {
  date: string;
  label: string;
  messages: Message[];
}

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnChanges {
  @Input() messages: Message[] = [];
  @Input() currentUserId: string = '';

  messageGroups: MessageGroup[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      this.groupMessages();
      this.scrollToBottom();
    }
  }

  private groupMessages(): void {
    this.messageGroups = [];
    if (!this.messages?.length) return;

    let currentGroup: MessageGroup | null = null;

    for (const msg of this.messages) {
      const date = this.normalizeDate(msg.sentAt);
      const label = this.formatDateLabel(msg.sentAt);

      if (!currentGroup || currentGroup.date !== date) {
        currentGroup = { date, label, messages: [] };
        this.messageGroups.push(currentGroup);
      }
      currentGroup.messages.push(msg);
    }
  }

  private normalizeDate(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'Z');
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  formatDateLabel(dateStr?: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d = new Date(dateStr + 'Z');
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (msgDate.getTime() === today.getTime()) return "Today";
    if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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