package com.example.coplaybackend.Services.WebRTC;

import com.example.coplaybackend.Entities.Messaging.CallSession;
import com.example.coplaybackend.Entities.Messaging.CallStatus;
import com.example.coplaybackend.Entities.Messaging.CallType;
import com.example.coplaybackend.Entities.Messaging.Conversation;
import com.example.coplaybackend.Entities.Messaging.Participant;
import com.example.coplaybackend.Repositories.Messaging.CallSessionRepository;
import com.example.coplaybackend.Repositories.Messaging.ConversationRepository;
import com.example.coplaybackend.Repositories.Messaging.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public CallSession initiateCall(String conversationId, String initiatorId, CallType callType) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        String roomId = UUID.randomUUID().toString();

        CallSession callSession = CallSession.builder()
                .conversation(conversation)
                .callType(callType)
                .status(CallStatus.INITIATED)
                .startedAt(LocalDateTime.now())
                .roomId(roomId)
                .build();

        callSession = callSessionRepository.save(callSession);

        notifyParticipants(conversationId, "call-initiated", callSession);

        return callSession;
    }

    public void sendOffer(String callId, String fromUserId, String sdpOffer) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        call.setStatus(CallStatus.RINGING);
        callSessionRepository.save(call);

        messagingTemplate.convertAndSend(
                "/topic/call/" + call.getRoomId(),
                new SignalingMessage("offer", fromUserId, sdpOffer, null)
        );
    }

    public void sendAnswer(String callId, String fromUserId, String sdpAnswer) {
        messagingTemplate.convertAndSend(
                "/topic/call/" + callId,
                new SignalingMessage("answer", fromUserId, sdpAnswer, null)
        );
    }

    public void sendIceCandidate(String callId, String fromUserId, String candidate) {
        messagingTemplate.convertAndSend(
                "/topic/call/" + callId,
                new SignalingMessage("ice-candidate", fromUserId, null, candidate)
        );
    }

    public void acceptCall(String callId, String userId) {
        CallSession call = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        call.setStatus(CallStatus.ACTIVE);
        callSessionRepository.save(call);

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
        call.setDurationSeconds(
                java.time.Duration.between(call.getStartedAt(), now).getSeconds()
        );
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

    private void notifyParticipants(String conversationId, String event, CallSession call) {
        List<Participant> participants = participantRepository
                .findByConversation_ConversationIdAndIsActiveTrue(conversationId);

        for (Participant p : participants) {
            messagingTemplate.convertAndSendToUser(
                    p.getUser().getUserId(),
                    "/queue/calls",
                    new SignalingMessage(event, null, null, null)
            );
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class SignalingMessage {
        private String type;
        private String fromUserId;
        private String sdp;
        private String candidate;
    }
}