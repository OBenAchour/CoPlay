package com.example.coplaybackend.Entities.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "message_reactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReaction {

    @Id
    private String reactionId;

    private Message message;

    private User user;

    private ReactionType reactionType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}