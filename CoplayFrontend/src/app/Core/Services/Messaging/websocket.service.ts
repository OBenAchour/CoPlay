import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, StompConfig } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private messageSubject = new Subject<any>();
  private typingSubject = new Subject<any>();
  private connectionSubject = new BehaviorSubject<boolean>(false);
  private callEventSubject = new Subject<any>();
  private serverUrl = 'http://localhost:8080/ws-call';
  private userId: string = '';
  private subscribedToAvailableCalls = false;

  connect(userId: string): void {
    this.userId = userId;

    const config: StompConfig = {
      webSocketFactory: () => new WebSocket(this.serverUrl),
      onConnect: () => {
        console.log('WebSocket connected');
        this.connectionSubject.next(true);
        this.subscribeToUserQueue();
        this.subscribeToAvailableCalls();
      },
      onStompError: (frame: any) => {
        console.error('STOMP error:', frame);
        this.connectionSubject.next(false);
      },
      onWebSocketError: (event: any) => {
        console.error('WebSocket error:', event);
        this.connectionSubject.next(false);
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.connectionSubject.next(false);
      }
    };

    this.stompClient = new Client(config);
    this.stompClient.activate();
  }

  disconnect(): void {
    this.subscribedToAvailableCalls = false;
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  subscribeToUserQueue(): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.subscribe(`/user/queue/messages`, (message: any) => {
      this.messageSubject.next(JSON.parse(message.body));
    });
  }

  subscribeToAvailableCalls(): void {
    if (!this.stompClient || !this.stompClient.connected) return;
    if (this.subscribedToAvailableCalls) return;
    this.subscribedToAvailableCalls = true;

    this.stompClient.subscribe('/topic/calls/available', (message: any) => {
      this.callEventSubject.next(JSON.parse(message.body));
    });
  }

  subscribeToConversation(conversationId: string): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.subscribe(`/topic/conversation/${conversationId}`, (message: any) => {
      this.messageSubject.next(JSON.parse(message.body));
    });

    this.stompClient.subscribe(`/topic/conversation/${conversationId}/typing`, (message: any) => {
      this.typingSubject.next(JSON.parse(message.body));
    });
  }

  sendMessage(conversationId: string, message: any): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.publish({
      destination: `/app/chat/${conversationId}`,
      body: JSON.stringify(message)
    });
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.publish({
      destination: `/app/typing/${conversationId}`,
      body: JSON.stringify({ userId: this.userId, isTyping })
    });
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  onTyping(): Observable<any> {
    return this.typingSubject.asObservable();
  }

  onConnection(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  onCallEvent(): Observable<any> {
    return this.callEventSubject.asObservable();
  }

  isConnected(): boolean {
    return this.stompClient?.connected ?? false;
  }

  getStompClient() {
    return this.stompClient;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}