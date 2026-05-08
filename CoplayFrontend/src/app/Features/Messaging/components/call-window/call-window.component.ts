import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CallService } from 'src/app/Core/Services/Call/call.service';
import { WebRTCService } from 'src/app/Core/Services/Call/webrtc.service';

@Component({
  selector: 'app-call-window',
  templateUrl: './call-window.component.html',
  styleUrls: ['./call-window.component.css']
})
export class CallWindowComponent implements OnInit, OnDestroy {
  @Input() conversationId!: string;
  @Input() callType: 'AUDIO' | 'VIDEO' = 'AUDIO';
  @Input() isIncoming = false;
  @Input() incomingCallId?: string;
  @Input() incomingRoomId?: string;
  @Output() endCall = new EventEmitter<void>();

  callStatus: 'connecting' | 'ringing' | 'connected' | 'ended' = 'connecting';
  isMuted = false;
  isVideoOff = false;
  roomId?: string;
  callId?: string;
  isInitiator = false;
  
  private offerSent = false;
  private answerReceived = false;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private callService: CallService,
    private webrtcService: WebRTCService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('[CALL-WINDOW] ngOnInit - isIncoming:', this.isIncoming);
    
    try {
      await this.webrtcService.initialize(this.callType === 'VIDEO');
      this.webrtcService.createPeerConnection();

      if (this.isIncoming && this.incomingCallId && this.incomingRoomId) {
        console.log('[CALL-WINDOW] Mode INCOMING - callId:', this.incomingCallId, 'roomId:', this.incomingRoomId);
        this.callId = this.incomingCallId;
        this.roomId = this.incomingRoomId;
        this.callStatus = 'ringing';
        this.isInitiator = false;
        this.subscribeToCallEvents();
        
        this.callService.acceptCall(this.incomingCallId).subscribe();
      } else {
        console.log('[CALL-WINDOW] Mode OUTGOING - conversationId:', this.conversationId);
        this.isInitiator = true;
        await this.startOutgoingCall();
      }
    } catch (error) {
      console.error('[CALL-WINDOW] Failed to initialize:', error);
      this.callStatus = 'ended';
    }
  }

  private async startOutgoingCall(): Promise<void> {
    console.log('[CALL-WINDOW] startOutgoingCall');
    
    this.callService.startCall(this.conversationId, this.callType).subscribe({
      next: async (call) => {
        console.log('[CALL-WINDOW] startCall SUCCESS - callId:', call.callId, 'roomId:', call.roomId);
        this.callId = call.callId;
        this.roomId = call.roomId;
        this.callStatus = 'ringing';
        this.subscribeToCallEvents();
        await this.initiateWebRTC();
      },
      error: (err) => {
        console.error('[CALL-WINDOW] startCall ERROR:', err);
        this.callStatus = 'ended';
      }
    });
  }

  private async initiateWebRTC(): Promise<void> {
    if (this.offerSent || !this.roomId) return;
    
    console.log('[CALL-WINDOW] Creating offer...');
    this.offerSent = true;

    const offer = await this.webrtcService.createOffer();
    if (offer && this.callId) {
      console.log('[CALL-WINDOW] Offer created, sending to backend');
      this.callService.sendOffer(this.callId, JSON.stringify(offer)).subscribe({
        next: () => console.log('[CALL-WINDOW] Offer sent successfully'),
        error: (err) => {
          console.error('[CALL-WINDOW] Failed to send offer:', err);
          this.offerSent = false;
        }
      });
    }
  }

  private subscribeToCallEvents(): void {
    if (!this.roomId) {
      console.warn('[CALL-WINDOW] No roomId, cannot subscribe');
      return;
    }

    console.log('[CALL-WINDOW] Subscribing to room:', this.roomId);

    this.unsubscribe = this.callService.subscribeToCallRoom(this.roomId, {
      onCallInitiated: (data) => {
        console.log('[CALL-WINDOW] Call initiated received:', data);
      },
      
      onOffer: async (data) => {
        console.log('[CALL-WINDOW] RECEIVED OFFER');
        if (this.callStatus === 'ended') return;

        try {
          const offer = JSON.parse(data.sdp);
          const answer = await this.webrtcService.createAnswer(offer);
          if (answer && this.callId) {
            this.callService.sendAnswer(this.callId, JSON.stringify(answer)).subscribe();
          }
        } catch (error) {
          console.error('[CALL-WINDOW] Error creating answer:', error);
        }
      },
      
      onAnswer: async (data) => {
        console.log('[CALL-WINDOW] RECEIVED ANSWER');
        if (this.callStatus === 'ended' || this.answerReceived || !this.offerSent) return;

        this.answerReceived = true;

        try {
          const answer = JSON.parse(data.sdp);
          await this.webrtcService.handleAnswer(answer);
          this.callStatus = 'connected';
          console.log('[CALL-WINDOW] Call connected!');
        } catch (error) {
          console.error('[CALL-WINDOW] Error handling answer:', error);
        }
      },
      
      onIceCandidate: async (data) => {
        if (this.callStatus === 'ended' || !data.candidate) return;
        const candidate = JSON.parse(data.candidate);
        await this.webrtcService.addIceCandidate(candidate);
      },
      
      onCallAccepted: () => {
        console.log('[CALL-WINDOW] CALL ACCEPTED');
        if (this.callStatus !== 'ended') {
          this.callStatus = 'connected';
        }
      },
      
      onCallDeclined: () => {
        console.log('[CALL-WINDOW] CALL DECLINED');
        this.callStatus = 'ended';
        this.endCallEvent();
      },
      
      onCallEnded: () => {
        console.log('[CALL-WINDOW] CALL ENDED');
        this.callStatus = 'ended';
        this.endCallEvent();
      }
    });
  }

  toggleMute(): void {
    this.webrtcService.toggleAudio();
    this.isMuted = !this.isMuted;
  }

  toggleVideo(): void {
    this.webrtcService.toggleVideo();
    this.isVideoOff = !this.isVideoOff;
  }

  endCallEvent(): void {
    console.log('[CALL-WINDOW] Ending call');
    this.webrtcService.endCall();
    if (this.callId) {
      this.callService.endCall(this.callId).subscribe();
    }
    this.endCall.emit();
  }

  decline(): void {
    console.log('[CALL-WINDOW] Declining call');
    if (this.callId) {
      this.callService.declineCall(this.callId).subscribe();
    }
    this.webrtcService.endCall();
    this.endCall.emit();
  }

  getStatusText(): string {
    switch (this.callStatus) {
      case 'connecting': return 'Connexion...';
      case 'ringing': return this.isInitiator ? 'Appel en cours...' : 'Sonnerie...';
      case 'connected': return 'En cours';
      case 'ended': return 'Terminé';
      default: return '';
    }
  }

  getRemoteStream() {
    return this.webrtcService.getRemoteStream().asObservable();
  }

  getLocalStream() {
    return this.webrtcService.getLocalStream();
  }

  ngOnDestroy(): void {
    console.log('[CALL-WINDOW] ngOnDestroy');
    this.unsubscribe?.();
    this.webrtcService.endCall();
  }
}