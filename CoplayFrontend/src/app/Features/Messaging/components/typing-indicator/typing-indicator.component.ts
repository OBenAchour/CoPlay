import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-typing-indicator',
  templateUrl: './typing-indicator.component.html',
  styleUrls: ['./typing-indicator.component.css']
})
export class TypingIndicatorComponent {
  @Input() userName = '';
}