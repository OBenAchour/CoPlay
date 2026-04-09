import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBubbleComponentComponent } from './chat-bubble.component.component';

describe('ChatBubbleComponentComponent', () => {
  let component: ChatBubbleComponentComponent;
  let fixture: ComponentFixture<ChatBubbleComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatBubbleComponentComponent]
    });
    fixture = TestBed.createComponent(ChatBubbleComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
