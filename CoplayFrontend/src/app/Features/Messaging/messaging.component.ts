import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Message } from '../../Core/Models/Messaging/Message';
import { ConversationListItem } from '../../Core/Models/Messaging/ConversationListItem';
import { MessagingService } from '../../Core/Services/Messaging/messaging.service';
import { WebSocketService } from '../../Core/Services/Messaging/websocket.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { User } from '../../Core/Models/Auth/User';

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

  showNewMessageModal = false;
  searchQuery = '';
  searchedUsers: User[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private messagingService: MessagingService,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8080/api/users/me').subscribe({
      next: (user) => {
        this.currentUserId = user.userId;
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

    const msgSub = this.webSocketService.onMessage().subscribe(msg => {
      this.handleNewMessage(msg);
    });
    this.subscriptions.push(msgSub);
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
      
      // MARQUER LES MESSAGES COMME LUS
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
      error: (err) => console.error('Error searching:', err)
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