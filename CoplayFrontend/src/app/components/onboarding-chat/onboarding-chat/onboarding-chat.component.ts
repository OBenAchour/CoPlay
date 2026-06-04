import { Component, Input, OnInit } from '@angular/core';
import { OnboardingService, MessageEntry } from 'src/app/services/onboarding/onboarding.service';

@Component({
  selector: 'app-onboarding-chat',
  templateUrl: './onboarding-chat.component.html',
  styleUrls: ['./onboarding-chat.component.css']
})
export class OnboardingChatComponent implements OnInit {
  @Input() teamId!: string;
  @Input() userId!: string;

  messages: MessageEntry[] = [];
  inputText = '';
  loading = false;

  constructor(private onboardingService: OnboardingService) {}

  ngOnInit(): void {
    this.onboardingService.getHistory(this.teamId, this.userId).subscribe({
      next: (msgs: MessageEntry[]) => {
        this.messages = msgs;
        if (msgs.length === 0) this.sendWelcome();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement de l\'historique:', err);
      }
    });
  }

  sendWelcome(): void {
    this.send("Bonjour ! Je viens de rejoindre l'équipe, peux-tu m'accueillir et me guider ?");
  }

  send(text?: string): void {
    const message = text || this.inputText.trim();
    if (!message || this.loading) return;
    this.inputText = '';
    this.messages.push({ role: 'user', content: message });
    this.loading = true;

    this.onboardingService.chat(this.teamId, this.userId, message).subscribe({
      next: (res: any) => {
        this.messages.push({ role: 'assistant', content: res.reply });
        this.loading = false;
        // Auto-scroll vers le bas
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err: any) => {
        console.error('ONBOARDING ERROR', err);
        const errorMsg = err?.error?.message || 'Erreur de communication avec l\'assistant';
        this.messages.push({ role: 'assistant', content: errorMsg });
        this.loading = false;
      }
    });
  }

  clear(): void {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser la conversation ?')) return;
    this.onboardingService.clearHistory(this.teamId, this.userId).subscribe({
      next: () => {
        this.messages = [];
        this.sendWelcome();
      },
      error: (err: any) => console.error('Erreur lors de la réinitialisation:', err)
    });
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    const messagesDiv = document.querySelector('.chat-messages');
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }
}
