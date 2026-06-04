package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "onboarding_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingMessage {
    @Id
    private String id;
    private String teamId;
    private String userId;
    private List<MessageEntry> messages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageEntry {
        private String role;    // "user" ou "assistant"
        private String content;
        private LocalDateTime timestamp;
    }
}