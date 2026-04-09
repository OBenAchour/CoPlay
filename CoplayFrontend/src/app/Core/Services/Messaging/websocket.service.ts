import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, StompConfig } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private messageSubject = new Subject<any>();
  private typingSubject = new Subject<any>();
  private connectionSubject = new Subject<boolean>();

  private serverUrl = 'http://localhost:8080/ws-call';
  private userId: string = '';

  connect(userId: string): void {
    this.userId = userId;

    const config: StompConfig = {
      webSocketFactory: () => new WebSocket(this.serverUrl),
      onConnect: () => {
        console.log('WebSocket connected');
        this.connectionSubject.next(true);
        this.subscribeToUserQueue();
      },
      onStompError: (frame: any) => {
        console.error('STOMP error:', frame);
        this.connectionSubject.next(false);
      },
      onWebSocketError: (event: any) => {
        console.error('WebSocket error:', event);
        this.connectionSubject.next(false);
      }
    };

    this.stompClient = new Client(config);
    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
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

  private subscribeToUserQueue(): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.subscribe(`/user/queue/messages`, (message: any) => {
      this.messageSubject.next(JSON.parse(message.body));
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

  isConnected(): boolean {
    return this.stompClient?.connected ?? false;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}