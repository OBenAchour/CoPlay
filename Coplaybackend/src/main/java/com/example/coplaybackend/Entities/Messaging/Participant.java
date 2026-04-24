package com.example.coplaybackend.Entities.Messaging;
import com.example.coplaybackend.Entities.Auth.User;
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

    private Conversation conversation;   // ref → Conversation

    private User user;           // ref → User

    private ParticipantRole role;

    private LocalDateTime joinedAt;

    private LocalDateTime lastReadAt;

    private Boolean isActive = true;
}
