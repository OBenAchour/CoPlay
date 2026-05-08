import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from 'src/app/Core/Models/Messaging/Message';
import { MessagingService } from 'src/app/Core/Services/Messaging/messaging.service';
import { WebSocketService } from 'src/app/Core/Services/Messaging/websocket.service';
import { CallService } from 'src/app/Core/Services/Call/call.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { User } from 'src/app/Core/Models/Auth/User';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConversationListItem } from 'src/app/Core/Models/Messaging/ConversationListItem';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit, OnDestroy {
  isChatOpen = false;
  conversations: ConversationListItem[] = [];
  selectedConversation: ConversationListItem | null = null;
  messages: Message[] = [];
  currentUserId = '';
  currentUserEmail = '';
  incomingCall: { callId: string; callType: 'AUDIO' | 'VIDEO'; callerName: string; fromUserId: string } | null = null;
  activeCall: { conversationId: string; type: 'AUDIO' | 'VIDEO'; isIncoming: boolean; callId?: string } | null = null;

  showNewMessageModal = false;
  searchQuery = '';
  searchedUsers: User[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private messagingService: MessagingService,
    private webSocketService: WebSocketService,
    private callService: CallService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8080/api/users/me').subscribe({
      next: (user) => {
        this.currentUserId = user.userId;
        this.currentUserEmail = user.email;
        this.loadConversations();
        this.initWebSocket();
      },
      error: (err) => console.error('Error getting user:', err)
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();
  }

  loadConversations(): void {
    const sub = this.messagingService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data;
      },
      error: (err) => console.error('Error loading conversations:', err)
    });
    this.subscriptions.push(sub);
  }

  loadMessages(conversationId: string): void {
    const sub = this.messagingService.getMessages(conversationId).subscribe({
      next: (data) => {
        this.messages = data;
      },
      error: (err) => console.error('Error loading messages:', err)
    });
    this.subscriptions.push(sub);
  }

  initWebSocket(): void {
    this.webSocketService.connect(this.currentUserId);

    // ATTENDRE la connexion WebSocket avant de s'abonner
    const connSub = this.webSocketService.onConnection().subscribe((connected) => {
      if (connected) {
        console.log('[MESSAGING] WebSocket connected, subscribing to signaling events');
        this.callService.subscribeToSignalingEvents();
      }
    });
    this.subscriptions.push(connSub);

    // Abonnement aux messages de chat
    const msgSub = this.webSocketService.onMessage().subscribe(msg => {
      this.handleNewMessage(msg);
    });
    this.subscriptions.push(msgSub);

    // Abonnement aux événements d'appel (call-initiated)
    const callSub = this.webSocketService.onCallEvent().subscribe(event => {
      this.handleIncomingCall(event);
    });
    this.subscriptions.push(callSub);
  }

  handleIncomingCall(event: any): void {
    console.log('[MESSAGING] handleIncomingCall:', event);
    console.log('[MESSAGING] currentUserId:', this.currentUserId);
    console.log('[MESSAGING] currentUserEmail:', this.currentUserEmail);
    
    if (event.type === 'call-initiated') {
      if (event.fromUserId === this.currentUserId || event.fromUserId === this.currentUserEmail) {
        console.log('[MESSAGING] Ignoring own call-initiated event');
        return;
      }
      
      if (this.activeCall || this.incomingCall) {
        console.log('[MESSAGING] Ignoring - already have active call or incoming call');
        return;
      }

      console.log('[MESSAGING] Showing incoming call notification');
      this.incomingCall = {
        callId: event.callId,
        callType: (event.callType as 'AUDIO' | 'VIDEO') || 'AUDIO',
        callerName: event.callerName || 'Appel entrant',
        fromUserId: event.fromUserId
      };
    }
  }

  acceptIncomingCall(): void {
    if (this.incomingCall) {
      this.activeCall = {
        conversationId: '',
        type: this.incomingCall.callType,
        isIncoming: true,
        callId: this.incomingCall.callId
      };
      this.incomingCall = null;
    }
  }

  declineIncomingCall(): void {
    if (this.incomingCall?.callId) {
      this.callService.declineCall(this.incomingCall.callId).subscribe();
    }
    this.incomingCall = null;
  }

  onEndCall(): void {
    this.activeCall = null;
  }

  handleNewMessage(message: Message): void {
    if (this.selectedConversation?.conversationId === message.conversation?.conversationId) {
      this.messages.push(message);
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  selectConversation(conv: ConversationListItem | null): void {
    this.selectedConversation = conv;
    if (conv?.conversationId) {
      this.loadMessages(conv.conversationId);
      this.webSocketService.subscribeToConversation(conv.conversationId);
      
      this.messagingService.markAsRead(conv.conversationId).subscribe({
        next: () => {
          this.loadConversations();
        },
        error: (err) => console.error('Error marking as read:', err)
      });
    }
  }

  get totalUnreadCount(): number {
    return this.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  }

  onSendMessage(content: string): void {
    if (!this.selectedConversation?.conversationId) return;

    const sub = this.messagingService.sendMessage(
      this.selectedConversation.conversationId,
      content
    ).subscribe({
      next: (msg) => {
        this.messages.push(msg);
      },
      error: (err) => console.error('Error sending message:', err)
    });
    this.subscriptions.push(sub);
  }

  onSearch(query: string): void {
    if (!query.trim()) {
      this.loadConversations();
      return;
    }

    const sub = this.messagingService.searchMessages(query).subscribe({
      next: (results) => {
        console.log('Search results:', results);
      },
      error: (err) => console.error('Error searching messages:', err)
    });
    this.subscriptions.push(sub);
  }

  openNewMessage(): void {
    this.showNewMessageModal = true;
    this.searchQuery = '';
    this.searchedUsers = [];
  }

  closeNewMessage(): void {
    this.showNewMessageModal = false;
    this.searchQuery = '';
    this.searchedUsers = [];
  }

  searchUsers(query: string): void {
    if (!query.trim()) {
      this.searchedUsers = [];
      return;
    }

    const sub = this.messagingService.searchUsers(query).subscribe({
      next: (users) => {
        this.searchedUsers = users;
      },
      error: (err) => console.error('Error searching users:', err)
    });
    this.subscriptions.push(sub);
  }

  startConversation(user: User): void {
    const sub = this.messagingService.createConversation({
      type: 'DIRECT',
      name: user.profile.displayName || 'Direct Message',
      participantIds: [this.currentUserId, user.userId]
    }).subscribe({
      next: (conv) => {
        console.log('Conversation created:', conv);
        this.selectConversation(conv);
        this.closeNewMessage();
        this.loadConversations();
      },
      error: (err) => console.error('Error creating conversation:', err)
    });
    this.subscriptions.push(sub);
  }
}