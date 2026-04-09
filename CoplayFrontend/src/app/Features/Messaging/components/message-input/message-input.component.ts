import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent implements OnInit {
  @Input() message = '';
  @Output() messageChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<void>();
  @Output() typing = new EventEmitter<boolean>();

  ngOnInit(): void {}

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.messageChange.emit(target.value);
    this.typing.emit(true);
  }

  onSend(): void {
    if (this.message.trim()) {
      this.send.emit();
      this.typing.emit(false);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}