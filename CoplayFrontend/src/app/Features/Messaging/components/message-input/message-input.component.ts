import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Message } from 'src/app/Core/Models/Messaging/Message';
import { AIService } from 'src/app/Core/Services/AI/ai.service';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent implements OnInit, OnDestroy {
  @Input() message = '';
  @Input() messages: Message[] = [];
  @Output() messageChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<void>();
  @Output() typing = new EventEmitter<boolean>();

  suggestions: string[] = [];
  showSuggestions = false;
  isLoadingSuggestions = false;

  private inputSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];
  
  private lastApiCall = 0;
  private readonly API_COOLDOWN_MS = 2000;
  private readonly API_DEBOUNCE_MS = 400;
  constructor(private aiService: AIService) {}

  ngOnInit(): void {
    const inputSub = this.inputSubject.pipe(
      debounceTime(this.API_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap(text => {
        if (text.length >= 2) {
          // Rate limiting: vérifier si assez de temps s'est écoulé
          const now = Date.now();
          if (now - this.lastApiCall < this.API_COOLDOWN_MS) {
            return of({ suggestions: [] });
          }
          this.lastApiCall = now;
          
          this.isLoadingSuggestions = true;
          const context = this.buildContext();
          return this.aiService.getMultipleSuggestions(text, context, 3);
        } else {
          return of({ suggestions: [] });
        }
      })
    ).subscribe({
      next: (response: any) => {
        this.isLoadingSuggestions = false;
        // Don't show stale suggestions if the user already sent the message (input cleared)
        if (response && response.suggestions && this.message.trim().length >= 2) {
          this.suggestions = response.suggestions.filter((s: string) => s && s.trim());
          this.showSuggestions = this.suggestions.length > 0;
        } else {
          this.suggestions = [];
          this.showSuggestions = false;
        }
      },
      error: (err) => {
        console.error('API Error:', err); 
        this.isLoadingSuggestions = false;
        console.error('Error fetching suggestions:', err);
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });

    this.subscriptions.push(inputSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private buildContext(): string {
    if (!this.messages || this.messages.length === 0) {
      return '';
    }

    const recentMessages = this.messages
      .slice(-5)
      .map(m => `${m.sender?.profile?.displayName || 'User'}: ${m.content}`)
      .join('\n');

    return recentMessages;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.message = target.value;
    this.messageChange.emit(this.message);
    this.typing.emit(true);

    this.inputSubject.next(this.message);

    if (this.message.length < 2) {
      this.showSuggestions = false;
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: string): void {
    this.message = this.message + suggestion;
    this.messageChange.emit(this.message);
    this.showSuggestions = false;
    this.suggestions = [];
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onSend(): void {
    if (this.message.trim()) {
      this.showSuggestions = false;
      this.suggestions = [];
      this.send.emit();
      // Explicitly clear message and notify parent
      this.message = '';
      this.messageChange.emit('');
      this.typing.emit(false);
    }
  }

  // Using keydown (keypress is deprecated and may miss Enter in some browsers)
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
    if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  dismissSuggestions(): void {
    this.showSuggestions = false;
  }
}