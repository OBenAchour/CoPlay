import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from 'src/app/Core/Models/Messaging/Conversation';
import { Message } from 'src/app/Core/Models/Messaging/Message';
import { MessageReaction } from 'src/app/Core/Models/Messaging/MessageReaction';
import { SearchResult } from 'src/app/Core/Models/Messaging/SearchResult';
import { ReactionType } from 'src/app/Core/Models/Messaging/ReactionType';
import { CreateConversationRequest } from 'src/app/Core/Models/Messaging/CreateConversationRequest';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // CONVERSATIONS
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${id}`);
  }

  createConversation(request: CreateConversationRequest): Observable<Conversation> {
  return this.http.post<Conversation>(`${this.apiUrl}/conversations`, request);
}

  deleteConversation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${id}`);
  }

  // PARTICIPANTS
  addParticipant(conversationId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/${conversationId}/participants`, { userId });
  }

  removeParticipant(conversationId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}/participants/${userId}`);
  }

  getParticipants(conversationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${conversationId}/participants`);
  }

  // MESSAGES
  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages/conversation/${conversationId}`);
  }

  sendMessage(conversationId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, {
      conversationId,
      content
    });
  }

  deleteMessage(messageId: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/messages/${messageId}`);
  }

  markAsRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/messages/conversation/${conversationId}/read`, {});
  }

  getUnreadCount(conversationId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/messages/conversations/${conversationId}/messages/unread-count`);
  }

  // MEDIA
  uploadMedia(messageId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/messages/${messageId}/media/upload`, formData);
  }

  getMedia(messageId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/${messageId}/media`);
  }

  // REACTIONS
  addReaction(messageId: string, reactionType: ReactionType): Observable<MessageReaction> {
    return this.http.post<MessageReaction>(`${this.apiUrl}/messages/${messageId}/reactions`, {
      reactionType
    });
  }

  removeReaction(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}/reactions`);
  }

  getReactions(messageId: string): Observable<MessageReaction[]> {
    return this.http.get<MessageReaction[]>(`${this.apiUrl}/messages/${messageId}/reactions`);
  }

  getReactionSummary(messageId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${messageId}/reactions/summary`);
  }

  // SEARCH
  searchMessages(query: string): Observable<SearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search/messages`, { params });
  }

  searchInConversation(conversationId: string, query: string): Observable<SearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search/conversations/${conversationId}/messages`, { params });
  }
  searchUsers(query: string): Observable<any[]> {
  const params = new HttpParams().set('q', query);
  return this.http.get<any[]>(`${this.apiUrl}/users/search`, { params });
}
}