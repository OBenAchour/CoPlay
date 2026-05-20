import { Component, Input, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
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
export class MessageListComponent implements AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() currentUserId: string = '';
  @Input() currentUserEmail: string = '';
  @ViewChild('messagesContainer') messagesContainerRef?: ElementRef;

  private _cachedMessages: Message[] = [];
  private _cachedGroups: MessageGroup[] = [];
  private prevMessageCount = 0;
  private shouldScroll = false;

  // Memoized getter: only recomputes when the messages array REFERENCE changes.
  // Angular runs getters on every CD cycle — without memoization this would
  // recreate the DOM on every cycle (= flicker).
  get messageGroups(): MessageGroup[] {
    if (this.messages === this._cachedMessages) {
      return this._cachedGroups;
    }
    this._cachedMessages = this.messages;
    this._cachedGroups = this.buildGroups(this.messages);
    return this._cachedGroups;
  }

  private buildGroups(messages: Message[]): MessageGroup[] {
    if (!messages?.length) return [];

    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    for (const msg of messages) {
      const date = this.normalizeDate(msg.sentAt);
      const label = this.formatDateLabel(msg.sentAt);

      if (!currentGroup || currentGroup.date !== date) {
        currentGroup = { date, label, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(msg);
    }
    return groups;
  }

  ngAfterViewChecked(): void {
    if (this.messages.length !== this.prevMessageCount) {
      this.prevMessageCount = this.messages.length;
      this.shouldScroll = true;
    }
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
    }
  }

  private normalizeDate(dateStr?: string): string {
    if (!dateStr) return 'today';
    const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  formatDateLabel(dateStr?: string): string {
    if (!dateStr) return "Aujourd'hui";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (msgDate.getTime() === today.getTime()) return "Aujourd'hui";
    if (msgDate.getTime() === yesterday.getTime()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  scrollToBottom(): void {
    try {
      const el = this.messagesContainerRef?.nativeElement
        ?? document.querySelector('.messages-container');
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  isMyMessage(senderEmail: string): boolean {
    return !!(senderEmail && this.currentUserEmail && senderEmail === this.currentUserEmail);
  }

  // trackBy prevents Angular from destroying/recreating DOM nodes when the
  // array reference changes — without this every *ngFor update calls ngOnInit
  // on each message-bubble → repeated getReactionSummary() requests (the "loop")
  trackByDate(_index: number, group: MessageGroup): string {
    return group.date;
  }

  trackByMessageId(_index: number, message: Message): string {
    return message.messageId ?? `${message.sentAt}-${message.content}`;
  }
}
