import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebSocketService } from '../Messaging/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private apiUrl = 'http://localhost:8080/api';
  private subscribedRooms = new Map<string, boolean>();

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) {}

  startCall(conversationId: string, type: 'AUDIO' | 'VIDEO'): Observable<any> {
    return this.http.post(`${this.apiUrl}/calls/start/${conversationId}`, {}, {
      params: { callType: type }
    });
  }

  acceptCall(callId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/calls/${callId}/accept`, {});
  }

  declineCall(callId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/calls/${callId}/decline`, {});
  }

  endCall(callId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/calls/${callId}/end`, {});
  }

  sendOffer(callId: string, sdp: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/calls/${callId}/offer`, { sdp });
  }

  sendAnswer(callId: string, sdp: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/calls/${callId}/answer`, { sdp });
  }

  sendIceCandidate(callId: string, candidate: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/calls/${callId}/ice-candidate`, { candidate });
  }

  subscribeToCallRoom(roomId: string, callbacks: CallEventCallbacks): () => void {
    if (this.subscribedRooms.get(roomId)) {
      console.warn('[CALL-SERVICE] Already subscribed to room:', roomId);
      return () => {};
    }

    const stompClient = this.webSocketService.getStompClient();
    if (!stompClient || !stompClient.connected) {
      console.error('[CALL-SERVICE] STOMP client not available');
      return () => {};
    }

    console.log('[CALL-SERVICE] Subscribing to /topic/call/', roomId);
    this.subscribedRooms.set(roomId, true);

    const subscription = stompClient.subscribe(`/topic/call/${roomId}`, (message: any) => {
      const data = JSON.parse(message.body);
      console.log('[CALL-SERVICE] Message on', roomId + ':', data.type);
      
      switch (data.type) {
        case 'call-initiated': callbacks.onCallInitiated?.(data); break;
        case 'offer': callbacks.onOffer?.(data); break;
        case 'answer': callbacks.onAnswer?.(data); break;
        case 'ice-candidate': callbacks.onIceCandidate?.(data); break;
        case 'call-accepted': callbacks.onCallAccepted?.(data); break;
        case 'call-declined': callbacks.onCallDeclined?.(data); break;
        case 'call-ended': callbacks.onCallEnded?.(data); break;
      }
    });

    return () => {
      console.log('[CALL-SERVICE] Unsubscribing from room:', roomId);
      subscription.unsubscribe();
      this.subscribedRooms.delete(roomId);
    };
  }

  unsubscribeFromRoom(roomId: string): void {
    this.subscribedRooms.delete(roomId);
  }

  isSubscribed(roomId: string): boolean {
    return this.subscribedRooms.get(roomId) || false;
  }
}

export interface CallEventCallbacks {
  onCallInitiated?: (data: any) => void;
  onOffer?: (data: any) => void;
  onAnswer?: (data: any) => void;
  onIceCandidate?: (data: any) => void;
  onCallAccepted?: (data: any) => void;
  onCallDeclined?: (data: any) => void;
  onCallEnded?: (data: any) => void;
}