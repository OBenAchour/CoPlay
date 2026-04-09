package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.Entities.Messaging.CallSession;
import com.example.coplaybackend.Entities.Messaging.CallType;
import com.example.coplaybackend.Services.WebRTC.SignalingService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calls")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CallController {

    private final SignalingService signalingService;

    @PostMapping("/start/{conversationId}")
    public ResponseEntity<CallSession> startCall(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "AUDIO") CallType callType) {

        String userId = SecurityUtils.getCurrentUserId();
        log.info("Starting {} call in conversation {} by user {}", callType, conversationId, userId);

        CallSession call = signalingService.initiateCall(conversationId, userId, callType);
        return ResponseEntity.ok(call);
    }

    @PostMapping("/{callId}/offer")
    public ResponseEntity<Void> sendOffer(
            @PathVariable String callId,
            @RequestBody Map<String, String> payload) {

        String userId = SecurityUtils.getCurrentUserId();
        String sdpOffer = payload.get("sdp");
        signalingService.sendOffer(callId, userId, sdpOffer);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{callId}/answer")
    public ResponseEntity<Void> sendAnswer(
            @PathVariable String callId,
            @RequestBody Map<String, String> payload) {

        String userId = SecurityUtils.getCurrentUserId();
        String sdpAnswer = payload.get("sdp");
        signalingService.sendAnswer(callId, userId, sdpAnswer);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{callId}/ice-candidate")
    public ResponseEntity<Void> sendIceCandidate(
            @PathVariable String callId,
            @RequestBody Map<String, String> payload) {

        String userId = SecurityUtils.getCurrentUserId();
        String candidate = payload.get("candidate");
        signalingService.sendIceCandidate(callId, userId, candidate);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{callId}/accept")
    public ResponseEntity<Void> acceptCall(@PathVariable String callId) {
        String userId = SecurityUtils.getCurrentUserId();
        signalingService.acceptCall(callId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{callId}/decline")
    public ResponseEntity<Void> declineCall(@PathVariable String callId) {
        String userId = SecurityUtils.getCurrentUserId();
        signalingService.declineCall(callId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{callId}/end")
    public ResponseEntity<Void> endCall(@PathVariable String callId) {
        String userId = SecurityUtils.getCurrentUserId();
        signalingService.endCall(callId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{conversationId}/status")
    public ResponseEntity<?> getCallStatus(@PathVariable String conversationId) {
        CallSession call = signalingService.getCallStatus(conversationId);
        if (call == null) {
            return ResponseEntity.ok(Map.of("active", false));
        }
        return ResponseEntity.ok(Map.of(
                "active", true,
                "callId", call.getCallId(),
                "type", call.getCallType(),
                "status", call.getStatus(),
                "roomId", call.getRoomId()
        ));
    }
}