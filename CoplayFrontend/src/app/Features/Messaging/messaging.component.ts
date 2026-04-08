import { Component, OnInit, OnDestroy } from '@angular/core';
import { Conversation } from 'src/app/Core/Models/Messaging/Conversation';
import { Message } from 'src/app/Core/Models/Messaging/Message';
import { MessagingService } from 'src/app/Core/Services/Messaging/messaging.service';
import { WebSocketService } from 'src/app/Core/Services/Messaging/websocket.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { User } from 'src/app/Core/Models/Auth/User';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit, OnDestroy {
  isChatOpen = false;
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  currentUserId = '';
  
  // NEW: New Message Modal state
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
  // Direct call to correct URL (bypasses auth.service's wrong URL)
  this.http.get<any>('http://localhost:8080/api/users/me').subscribe({
    next: (user) => {
      this.currentUserId = user.userId;  // Real MongoDB ID
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

  selectConversation(conv: Conversation | null): void {
    this.selectedConversation = conv;
    if (conv?.conversationId) {
      this.loadMessages(conv.conversationId);
      this.webSocketService.subscribeToConversation(conv.conversationId);
    }
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
        // Transformer les résultats en conversations
        console.log('Search results:', results);
      },
      error: (err) => console.error('Error searching:', err)
    });
    this.subscriptions.push(sub);
  }
    // NEW: New Message Modal methods
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
