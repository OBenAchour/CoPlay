import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MessagingComponent } from './messaging.component';
import { MessagingService } from 'src/app/Core/Services/Messaging/messaging.service';
import { WebSocketService } from 'src/app/Core/Services/Messaging/websocket.service';
import { CallService } from 'src/app/Core/Services/Call/call.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('MessagingComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessagingComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MessagingService, useValue: {} },
        { provide: WebSocketService, useValue: { connect: () => {}, disconnect: () => {}, onConnection: () => ({ subscribe: () => {} }), onMessage: () => ({ subscribe: () => {} }), onCallEvent: () => ({ subscribe: () => {} }) } },
        { provide: CallService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MessagingComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
