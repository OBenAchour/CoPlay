import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-call-notification',
  templateUrl: './call-notification.component.html',
  styleUrls: ['./call-notification.component.css']
})
export class CallNotificationComponent {
  @Output() accept = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();
  @Input() callerName = 'Appel entrant';
  @Input() callType: 'AUDIO' | 'VIDEO' = 'AUDIO';
  
  isVisible = false;

  show(callerName: string, callType: 'AUDIO' | 'VIDEO'): void {
    this.callerName = callerName;
    this.callType = callType;
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  onAccept(): void {
    this.accept.emit();
    this.hide();
  }

  onDecline(): void {
    this.decline.emit();
    this.hide();
  }
}