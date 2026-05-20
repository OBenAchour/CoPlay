import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

// Models
import { Message } from 'src/app/Core/Models/Messaging/Message';
import { ConversationListItem } from 'src/app/Core/Models/Messaging/ConversationListItem';
import { User } from 'src/app/Core/Models/Auth/User';

// Services
import { MessagingService } from 'src/app/Core/Services/Messaging/messaging.service';
import { WebSocketService } from 'src/app/Core/Services/Messaging/websocket.service';
import { CallService } from 'src/app/Core/Services/Call/call.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';

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
  
  incomingCall: { 
    callId: string; 
    roomId: string;
    callType: 'AUDIO' | 'VIDEO'; 
    callerName: string; 
    fromUserId: string 
  } | null = null;
  
  activeCall: { 
    conversationId: string; 
    type: 'AUDIO' | 'VIDEO'; 
    isIncoming: boolean; 
    callId?: string;
    roomId?: string;
  } | null = null;

  showNewMessageModal = false;
  searchQuery = '';
  searchedUsers: User[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private messagingService: MessagingService,
    private webSocketService: WebSocketService,
    private callService: CallService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId    = this.authService.getUserId();
    this.currentUserEmail = this.authService.getUserEmail() || '';
    this.incomingCall = null;
    this.activeCall   = null;
    this.initWebSocket();
    this.loadConversations();
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
    // Use email as the STOMP principal (Spring Boot JWT sub = email, not ObjectId)
    const principal = this.currentUserEmail || this.currentUserId;
    this.webSocketService.connect(principal);

    const connSub = this.webSocketService.onConnection().subscribe((connected) => {
      if (connected) {
        this.reconnectAttempts = 0;
        this.webSocketService.subscribeToAvailableCalls();
        // Re-subscribe to active conversation if the WS reconnected
        if (this.selectedConversation?.conversationId) {
          this.webSocketService.subscribeToConversation(this.selectedConversation.conversationId);
        }
      } else {
        // Auto-reconnect after 3 s (max 5 attempts)
        this.scheduleReconnect();
      }
    });
    this.subscriptions.push(connSub);

    const msgSub = this.webSocketService.onMessage().subscribe(msg => {
      this.handleNewMessage(msg);
    });
    this.subscriptions.push(msgSub);

    const callSub = this.webSocketService.onCallEvent().subscribe(event => {
      this.handleIncomingCall(event);
    });
    this.subscriptions.push(callSub);
  }

  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT = 5;

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT) return;
    this.reconnectAttempts++;
    setTimeout(() => {
      if (!this.webSocketService.isConnected()) {
        const principal = this.currentUserEmail || this.currentUserId;
        this.webSocketService.connect(principal);
      } else {
        this.reconnectAttempts = 0;
      }
    }, 3000);
  }

  onCallStarted(call: { callId: string; roomId: string; type: 'AUDIO' | 'VIDEO' }): void {
    this.activeCall = {
      conversationId: this.selectedConversation?.conversationId || '',
      type: call.type,
      isIncoming: false,
      callId: call.callId,
      roomId: call.roomId
    };
  }

  handleIncomingCall(event: any): void {
    if (event.type === 'call-initiated') {
      if (!event.toUserIds || !Array.isArray(event.toUserIds)) return;
      if (!event.toUserIds.includes(this.currentUserId)) return;
      if (event.fromUserId === this.currentUserEmail) return;
      
      if (this.activeCall || this.incomingCall) return;
      this.incomingCall = {
        callId: event.callId,
        roomId: event.roomId,
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
        callId: this.incomingCall.callId,
        roomId: this.incomingCall.roomId
      };
      this.incomingCall = null;
    }
  }

  declineIncomingCall(): void {
    if (this.incomingCall) {
      this.callService.declineCall(this.incomingCall.callId).subscribe();
      this.incomingCall = null;
    }
  }

  onEndCall(): void {
    this.activeCall = null;
    this.incomingCall = null;
  }

  handleNewMessage(message: Message): void {
    if (this.selectedConversation?.conversationId === message.conversation?.conversationId) {
      // Avoid duplicate: the sender already has the message from the REST response
      if (message.messageId && this.messages.some(m => m.messageId === message.messageId)) return;
      // Create a NEW array reference so ngOnChanges fires in message-list
      this.messages = [...this.messages, message];
    } else {
      // Message arrived for a conversation not currently open → refresh unread counts
      this.loadConversations();
    }
  }

  toggleChat(): void {
    if (!this.isChatOpen) {
      this.incomingCall = null;
      this.activeCall = null;
    }
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
        // Create a NEW array reference so ngOnChanges fires in message-list
        this.messages = [...this.messages, msg];
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
    // On récupère d'abord l'ObjectId MongoDB de l'utilisateur courant
    // (le JWT contient l'email dans sub, pas l'ID — getUserId() retourne "")
    this.http.get<any>('http://localhost:8080/api/users/me').subscribe({
      next: (me) => {
        const myId = me.id || me.userId || me._id || '';
        const participantIds = myId ? [myId, user.userId] : [user.userId];

        const sub = this.messagingService.createConversation({
          type: 'DIRECT',
          name: user.profile?.displayName || user.email || 'Direct Message',
          participantIds
        }).subscribe({
          next: (conv) => {
            this.selectConversation(conv);
            this.closeNewMessage();
            this.loadConversations();
          },
          error: (err) => console.error('Error creating conversation:', err)
        });
        this.subscriptions.push(sub);
      },
      error: () => {
        // Fallback : essayer avec uniquement l'ID de la cible
        const sub = this.messagingService.createConversation({
          type: 'DIRECT',
          name: user.profile?.displayName || user.email || 'Direct Message',
          participantIds: [user.userId]
        }).subscribe({
          next: (conv) => {
            this.selectConversation(conv);
            this.closeNewMessage();
            this.loadConversations();
          },
          error: (err) => console.error('Error creating conversation:', err)
        });
        this.subscriptions.push(sub);
      }
    });
  }
}