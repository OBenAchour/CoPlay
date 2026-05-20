import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('localVideo', { static: false }) localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteAudio', { static: true }) remoteAudioRef!: ElementRef<HTMLAudioElement>;

  callStatus: 'connecting' | 'ringing' | 'connected' | 'ended' = 'connecting';
  isMuted = false;
  isVideoOff = false;
  remoteStream: MediaStream | null = null;
  private offerSent = false;
  private answerReceived = false;
  private unsubscribe: (() => void) | null = null;
  private remoteSub: Subscription | null = null;

  get callId(): string { return this.incomingCallId || ''; }
  get roomId(): string { return this.incomingRoomId || ''; }

  constructor(
    private callService: CallService,
    private webrtcService: WebRTCService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.webrtcService.initialize(this.callType === 'VIDEO');
      this.webrtcService.createPeerConnection();

      const localStream = this.webrtcService.getLocalStream();
      if (localStream) {
        setTimeout(() => {
          if (this.localVideoRef?.nativeElement) {
            this.localVideoRef.nativeElement.srcObject = localStream;
          }
        });
      }

      this.remoteSub = this.webrtcService.getRemoteStream().subscribe(stream => {
        this.remoteStream = stream;
        if (stream) {
          this.callStatus = 'connected';
          const audioEl = this.remoteAudioRef?.nativeElement;
          if (audioEl) {
            audioEl.srcObject = stream;
            audioEl.play().catch(e =>
              console.warn('[CALL-WINDOW] Audio autoplay blocked:', e)
            );
          }
        }
      });

      if (this.isIncoming && this.callId && this.roomId) {
        this.callStatus = 'ringing';
        this.subscribeToCallEvents();
        this.callService.acceptCall(this.callId).subscribe();
      } else if (this.callId && this.roomId) {
        this.callStatus = 'ringing';
        this.subscribeToCallEvents();
        await this.initiateWebRTC();
      } else {
        this.callStatus = 'ended';
      }
    } catch (error) {
      console.error('[CALL-WINDOW] Failed to initialize:', error);
      this.callStatus = 'ended';
    }
  }

  private async initiateWebRTC(): Promise<void> {
    if (this.offerSent || !this.roomId) return;
    this.offerSent = true;

    const offer = await this.webrtcService.createOffer();
    if (offer && this.callId) {
      this.callService.sendOffer(this.callId, JSON.stringify(offer)).subscribe({
        error: (err) => { console.error('[CALL-WINDOW] Failed to send offer:', err); this.offerSent = false; }
      });
    }
  }

  private subscribeToCallEvents(): void {
    if (!this.roomId) return;

    this.unsubscribe = this.callService.subscribeToCallRoom(this.roomId, {
      onCallInitiated: () => {},
      onOffer: async (data) => {
        if (this.callStatus === 'ended') return;
        // Only receiver handles offers; caller created theirs already
        if (!this.isIncoming) return;
        try {
          const offer = JSON.parse(data.sdp);
          const answer = await this.webrtcService.createAnswer(offer);
          if (answer && this.callId) {
            this.callService.sendAnswer(this.callId, JSON.stringify(answer)).subscribe();
          }
        } catch (error) { console.error('[CALL-WINDOW] Error creating answer:', error); }
      },
      onAnswer: async (data) => {
        if (this.callStatus === 'ended' || this.answerReceived) return;
        // Only the caller handles the answer; receiver created it locally
        if (this.isIncoming) return;
        this.answerReceived = true;
        try {
          const answer = JSON.parse(data.sdp);
          await this.webrtcService.handleAnswer(answer);
          this.callStatus = 'connected';
        } catch (error) { console.error('[CALL-WINDOW] Error handling answer:', error); }
      },
      onIceCandidate: async (data) => {
        if (this.callStatus === 'ended' || !data.candidate) return;
        await this.webrtcService.addIceCandidate(JSON.parse(data.candidate));
      },
      onCallAccepted: () => {
        if (this.callStatus !== 'ended') this.callStatus = 'connected';
      },
      onCallDeclined: () => { this.callStatus = 'ended'; this.endCallEvent(); },
      onCallEnded: () => { this.callStatus = 'ended'; this.endCallEvent(); }
    });
  }

  toggleMute(): void { this.webrtcService.toggleAudio(); this.isMuted = !this.isMuted; }
  toggleVideo(): void { this.webrtcService.toggleVideo(); this.isVideoOff = !this.isVideoOff; }

  endCallEvent(): void {
    this.webrtcService.endCall();
    if (this.callId) this.callService.endCall(this.callId).subscribe();
    this.endCall.emit();
  }

  decline(): void {
    if (this.callId) this.callService.declineCall(this.callId).subscribe();
    this.webrtcService.endCall();
    this.endCall.emit();
  }

  getStatusText(): string {
    switch (this.callStatus) {
      case 'connecting': return 'Connecting...';
      case 'ringing': return this.isIncoming ? 'Ringing...' : 'Calling...';
      case 'connected': return 'Connected';
      case 'ended': return 'Ended';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
    this.remoteSub?.unsubscribe();
    this.webrtcService.endCall();
  }
}
