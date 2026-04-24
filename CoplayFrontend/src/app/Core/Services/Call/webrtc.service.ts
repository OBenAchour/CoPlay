import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  onOffer: ((sdp: RTCSessionDescriptionInit) => void) | null = null;
  onAnswer: ((sdp: RTCSessionDescriptionInit) => void) | null = null;
  onIceCandidate: ((candidate: RTCIceCandidate) => void) | null = null;

  async initialize(video: boolean): Promise<MediaStream> {
    try {
      console.log('[WEBRTC] Initializing with video:', video);
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true
      });
      console.log('[WEBRTC] Media stream obtained');
      return this.localStream;
    } catch (error) {
      console.error('[WEBRTC] Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection(): void {
    if (this.peerConnection) {
      console.log('[WEBRTC] Peer connection already exists, reusing');
      return;
    }

    console.log('[WEBRTC] Creating new peer connection');
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('[WEBRTC] Remote track received');
      this.remoteStreamSubject.next(event.streams[0]);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('[WEBRTC] ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    this.peerConnection.onsignalingstatechange = () => {
      console.log('[WEBRTC] Signaling state:', this.peerConnection?.signalingState);
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log('[WEBRTC] Adding track:', track.kind);
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    this.pendingIceCandidates = [];
  }

  async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) {
      console.warn('[WEBRTC] No peer connection, creating one');
      this.createPeerConnection();
    }
    
    try {
      console.log('[WEBRTC] Creating offer, current state:', this.peerConnection?.signalingState);
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      console.log('[WEBRTC] Offer created, new state:', this.peerConnection?.signalingState);
      return offer;
    } catch (error) {
      console.error('[WEBRTC] Error creating offer:', error);
      return null;
    }
  }
  
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) {
      console.warn('[WEBRTC] No peer connection, creating one');
      this.createPeerConnection();
    }
    
    try {
      console.log('[WEBRTC] Creating answer, current state:', this.peerConnection?.signalingState);
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('[WEBRTC] Remote description set, state:', this.peerConnection?.signalingState);
      await this.flushPendingIceCandidates();
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      console.log('[WEBRTC] Answer created, new state:', this.peerConnection?.signalingState);
      return answer;
    } catch (error) {
      console.error('[WEBRTC] Error creating answer:', error);
      return null;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WEBRTC] No peer connection to handle answer');
      return;
    }

    try {
      const state = this.peerConnection.signalingState;
      console.log('[WEBRTC] Handling answer, current state:', state);
      
      if (state === 'closed') {
        console.warn('[WEBRTC] Peer connection closed, ignoring answer');
        return;
      }
      
      if (state === 'stable') {
        console.log('[WEBRTC] Already in stable state, ignoring duplicate answer');
        return;
      }

      if (state !== 'have-local-offer') {
        console.warn('[WEBRTC] Unexpected state for answer:', state);
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('[WEBRTC] Remote answer set, new state:', this.peerConnection.signalingState);
      await this.flushPendingIceCandidates();
    } catch (error) {
      console.error('[WEBRTC] Error handling answer:', error);
    }
  }

  private async flushPendingIceCandidates(): Promise<void> {
    console.log('[WEBRTC] Flushing pending ICE candidates, count:', this.pendingIceCandidates.length);
    while (this.pendingIceCandidates.length > 0) {
      const candidate = this.pendingIceCandidates.shift();
      if (candidate && this.peerConnection) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error('[WEBRTC] Error adding pending ICE candidate:', error);
        }
      }
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      console.warn('[WEBRTC] No peer connection, queuing ICE candidate');
      this.pendingIceCandidates.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.log('[WEBRTC] ICE candidate queued (remote desc may not be set):', candidate);
      this.pendingIceCandidates.push(candidate);
    }
  }

  toggleAudio(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }

  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }

  endCall(): void {
    console.log('[WEBRTC] Ending call');
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.pendingIceCandidates = [];
    this.remoteStreamSubject.next(null);
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): BehaviorSubject<MediaStream | null> {
    return this.remoteStreamSubject;
  }

  getSignalingState(): string | undefined {
    return this.peerConnection?.signalingState;
  }
}