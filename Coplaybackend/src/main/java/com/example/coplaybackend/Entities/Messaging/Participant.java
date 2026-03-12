package com.example.coplaybackend.Entities.Messaging;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant {

    @Id
    private String participantId;

    private String conversationId;   // ref → Conversation

    private String userId;           // ref → User

    private ParticipantRole role;

    private LocalDateTime joinedAt;

    private LocalDateTime lastReadAt;

    private Boolean isActive = true;
}
