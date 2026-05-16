package com.example.coplaybackend.Services.WebRTC;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Messaging.CallSession;
import com.example.coplaybackend.Entities.Messaging.CallStatus;
import com.example.coplaybackend.Entities.Messaging.CallType;
import com.example.coplaybackend.Entities.Messaging.Conversation;
import com.example.coplaybackend.Entities.Messaging.Participant;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Messaging.CallSessionRepository;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SignalingService {

    private final SimpMessagingTemplate messagingTemplate;
    private final CallSessionRepository callSessionRepository;
    private final ConversationRepository conversationRepository;
    private final ParticipantRepository participantRepository;
    private final UserRepository userRepository;

    public CallSession initiateCall(String conversationId, String initiatorId, CallType callType) {
        log.info("[SIGNALING] initiateCall - conversationId: {}, initiatorId: {}, callType: {}",
                conversationId, initiatorId, callType);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User initiator = userRepository.findByEmail(initiatorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String roomId = UUID.randomUUID().toString();

        CallSession callSession = CallSession.builder()
                .conversation(conversation)
                .callType(callType)
                .status(CallStatus.INITIATED)
                .startedAt(LocalDateTime.now())
                .roomId(roomId)
                .initiator(initiator)
                .build();

        callSession = callSessionRepository.save(callSession);
        log.info("[SIGNALING] CallSession saved: callId: {}, roomId: {}", callSession.getCallId(), roomId);

        // Envoyer notification vers topic disponible
        List<Participant> participants = participantRepository
                .findByConversation_ConversationIdAndIsActiveTrue(conversationId);

        List<String> otherParticipantIds = new ArrayList<>();
        List<String> otherParticipantEmails = new ArrayList<>();
        for (Participant p : participants) {
            if (!p.getUser().getUserId().equals(initiator.getUserId())) {
                otherParticipantIds.add(p.getUser().getUserId());
                otherParticipantEmails.add(p.getUser().getEmail());
            }
        }

        log.info("[SIGNALING] Participants found: {}, initiatorId: {}, toUserIds: {}, toEmails: {}",
                participants.size(), initiator.getUserId(), otherParticipantIds, otherParticipantEmails);

        CallNotificationMessage notification = new CallNotificationMessage(
                "call-initiated",
                callSession.getCallId(),
                roomId,
                callSession.getCallType().name(),
                initiator.getEmail(),
                otherParticipantIds,
                initiator.getProfile().getDisplayName()
        );

        log.info("[SIGNALING] Sending call-initiated to /topic/calls/available");
        messagingTemplate.convertAndSend("/topic/calls/available", notification);

        return callSession;
    }

    public void sendOffer(String callId, String fromUserId, String sdpOffer) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        call.setStatus(CallStatus.RINGING);
        call.setSdpOffer(sdpOffer);
        callSessionRepository.save(call);

        log.info("[SIGNALING] Offer stored for callId: {}", callId);

        messagingTemplate.convertAndSend(
                "/topic/call/" + call.getRoomId(),
                new SignalingMessage("offer", fromUserId, sdpOffer, null)
        );
    }

    public void sendAnswer(String callId, String fromUserId, String sdpAnswer) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        call.setSdpAnswer(sdpAnswer);
        callSessionRepository.save(call);

        log.info("[SIGNALING] Answer stored for callId: {}", callId);

        messagingTemplate.convertAndSend(
                "/topic/call/" + call.getRoomId(),
                new SignalingMessage("answer", fromUserId, sdpAnswer, null)
        );
    }

    public void sendIceCandidate(String callId, String fromUserId, String candidate) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        messagingTemplate.convertAndSend(
                "/topic/call/" + call.getRoomId(),
                new SignalingMessage("ice-candidate", fromUserId, null, candidate)
        );
    }

    public void acceptCall(String callId, String userId) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        call.setStatus(CallStatus.ACTIVE);
        callSessionRepository.save(call);

        log.info("[SIGNALING] Call accepted: callId: {}, by userId: {}", callId, userId);

        // Re-send the stored offer so the receiver (now subscribed) can process it
        if (call.getSdpOffer() != null) {
            messagingTemplate.convertAndSend(
                    "/topic/call/" + call.getRoomId(),
                    new SignalingMessage("offer", call.getInitiator().getEmail(), call.getSdpOffer(), null)
            );
            log.info("[SIGNALING] Re-sent stored offer to room: {}", call.getRoomId());
        }

        messagingTemplate.convertAndSend(
                "/topic/call/" + call.getRoomId(),
                new SignalingMessage("call-accepted", userId, null, null)
        );
    }

    public void declineCall(String callId, String userId) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        call.setStatus(CallStatus.DECLINED);
        call.setEndedAt(LocalDateTime.now());
        callSessionRepository.save(call);

        messagingTemplate.convertAndSend(
                "/topic/call/" + call.getRoomId(),
                new SignalingMessage("call-declined", userId, null, null)
        );
    }

    public void endCall(String callId, String userId) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        LocalDateTime now = LocalDateTime.now();
        call.setStatus(CallStatus.ENDED);
        call.setEndedAt(now);
        call.setDurationSeconds(java.time.Duration.between(call.getStartedAt(), now).getSeconds());
        callSessionRepository.save(call);

        messagingTemplate.convertAndSend(
                "/topic/call/" + call.getRoomId(),
                new SignalingMessage("call-ended", userId, null, null)
        );
    }

    public CallSession getCallStatus(String conversationId) {
        return callSessionRepository
                .findByConversation_ConversationIdAndStatusIn(
                        conversationId,
                        List.of(CallStatus.INITIATED, CallStatus.RINGING, CallStatus.ACTIVE)
                )
                .orElse(null);
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class SignalingMessage {
        private String type;
        private String fromUserId;
        private String sdp;
        private String candidate;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class CallNotificationMessage {
        private String type;
        private String callId;
        private String roomId;
        private String callType;
        private String fromUserId;
        private List<String> toUserIds;
        private String callerName;
    }
}