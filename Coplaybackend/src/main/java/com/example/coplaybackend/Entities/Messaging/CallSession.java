package com.example.coplaybackend.Entities.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "call_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallSession {

    @Id
    private String callId;

    private Conversation conversation;

    private CallType callType;

    private CallStatus status;

    private User initiator;

    private List<Participant> participants;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private Long durationSeconds;

    private String roomId;  // Pour WebRTC room identification

    private String sdpOffer;  // Stored offer for receiver to pick up

    private String sdpAnswer; // Stored answer
}